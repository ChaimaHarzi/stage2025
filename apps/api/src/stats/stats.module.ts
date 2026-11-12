/** Indicateurs du tableau de bord administrateur (état global du parc). */
import { Injectable, Module } from '@nestjs/common';
import { Field, Int, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { Roles } from '../common/auth.guard';
import { Role, Status } from '../common/enums';
import { PrismaService } from '../prisma/prisma.module';
import { SCAN_LOG_INCLUDE, ScanLog, scanLogToGraphQL } from '../scans/scans.module';

@ObjectType()
export class RepartitionItem {
  @Field() nom: string;
  @Field() couleur: string;
  @Field(() => Int) total: number;
}

@ObjectType()
export class DashboardStats {
  @Field(() => Int) totalEquipements: number;
  @Field(() => Int) enStock: number;
  @Field(() => Int) enProduction: number;
  @Field(() => Int) enReparation: number;
  @Field(() => Int) totalCategories: number;
  @Field(() => Int) totalFamilles: number;
  @Field(() => Int) totalOuvriers: number;
  @Field(() => Int) scansAujourdhui: number;
  @Field(() => [RepartitionItem]) parCategorie: RepartitionItem[];
  @Field(() => [RepartitionItem]) parFamille: RepartitionItem[];
  @Field(() => [ScanLog]) derniersScans: ScanLog[];
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(): Promise<DashboardStats> {
    const debutJournee = new Date();
    debutJournee.setHours(0, 0, 0, 0);
    const countBy = (status: Status) => this.prisma.equipement.count({ where: { status } });
    const withCount = { select: { nom: true, couleur: true, _count: { select: { equipements: true } } } } as const;

    const [total, stock, prod, rep, categories, familles, ouvriers, scansJour, derniers] = await Promise.all([
      this.prisma.equipement.count(),
      countBy(Status.STOCK),
      countBy(Status.PROD),
      countBy(Status.REP),
      this.prisma.categorie.findMany(withCount),
      this.prisma.famille.findMany(withCount),
      this.prisma.utilisateur.count({ where: { role: Role.OUVRIER } }),
      this.prisma.scanLog.count({ where: { createdAt: { gte: debutJournee } } }),
      this.prisma.scanLog.findMany({ include: SCAN_LOG_INCLUDE, orderBy: { createdAt: 'desc' }, take: 8 }),
    ]);

    const repartition = (rows: typeof categories) =>
      rows
        .map((r) => ({ nom: r.nom, couleur: r.couleur, total: r._count.equipements }))
        .sort((a, b) => b.total - a.total);

    return {
      totalEquipements: total,
      enStock: stock,
      enProduction: prod,
      enReparation: rep,
      totalCategories: categories.length,
      totalFamilles: familles.length,
      totalOuvriers: ouvriers,
      scansAujourdhui: scansJour,
      parCategorie: repartition(categories),
      parFamille: repartition(familles),
      derniersScans: derniers.map(scanLogToGraphQL),
    };
  }
}

@Resolver()
export class StatsResolver {
  constructor(private readonly service: StatsService) {}

  @Roles(Role.ADMIN)
  @Query(() => DashboardStats)
  dashboardStats() {
    return this.service.dashboard();
  }
}

@Module({
  providers: [StatsService, StatsResolver],
})
export class StatsModule {}
