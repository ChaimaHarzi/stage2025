/**
 * Traçabilité par code-barres.
 * Le nombre de lectures successives d'un même code détermine le nouveau statut :
 * 1 scan → en production, 2 scans → en stock, 3 scans → en réparation.
 * Le regroupement des lectures successives est fait par le client (interface web
 * de l'ouvrier ou Raspberry Pi), qui envoie le code et le nombre de lectures.
 */
import { Injectable, Module, NotFoundException } from '@nestjs/common';
import { Args, Field, ID, InputType, Int, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { IsIn, IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { AllowDevice, AuthUser, CurrentUser, IsDevice, Roles } from '../common/auth.guard';
import { Role, ScanSource, Status, STATUS_PAR_NOMBRE_DE_SCANS } from '../common/enums';
import { PrismaService } from '../prisma/prisma.module';

// ---------- Types GraphQL ----------

@ObjectType()
export class EquipementResume {
  @Field(() => ID) id: string;
  @Field() reference: string;
  @Field() nom: string;
}

@ObjectType()
export class UtilisateurResume {
  @Field(() => ID) id: string;
  @Field() email: string;
  @Field({ nullable: true }) nom?: string;
  @Field({ nullable: true }) prenom?: string;
}

@ObjectType()
export class ScanLog {
  @Field(() => ID) id: string;
  @Field(() => EquipementResume) equipement: EquipementResume;
  @Field(() => UtilisateurResume, { nullable: true, description: 'Absent pour un scan du système embarqué' })
  utilisateur?: UtilisateurResume;
  @Field(() => ScanSource) source: ScanSource;
  @Field(() => Int) nombreScans: number;
  @Field(() => Status) ancienStatus: Status;
  @Field(() => Status) nouveauStatus: Status;
  @Field() createdAt: Date;
}

@ObjectType()
export class ScanResult {
  @Field(() => EquipementResume) equipement: EquipementResume;
  @Field(() => Status) ancienStatus: Status;
  @Field(() => Status) nouveauStatus: Status;
  @Field(() => Int) nombreScans: number;
}

@InputType()
export class ScanInput {
  @Field({ description: 'Référence lue sur le code-barres' })
  @IsNotEmpty({ message: 'Code-barres vide.' })
  reference: string;

  @Field(() => Int, { description: 'Nombre de lectures successives (1, 2 ou 3)' })
  @IsInt()
  @Min(1, { message: 'Le nombre de scans doit être 1, 2 ou 3.' })
  @Max(3, { message: 'Le nombre de scans doit être 1, 2 ou 3.' })
  nombreScans: number;
}

@InputType()
export class ScanLogsFilter {
  @Field({ nullable: true }) @IsOptional() search?: string;
  @Field(() => ID, { nullable: true }) @IsOptional() equipementId?: string;
  @Field(() => ScanSource, { nullable: true }) @IsOptional() source?: ScanSource;
  @Field(() => Int, { nullable: true, defaultValue: 200 })
  @IsOptional()
  @IsInt()
  @IsIn([25, 50, 100, 200, 500])
  limit?: number;
}

// ---------- Service ----------

export const SCAN_LOG_INCLUDE = {
  equipement: { select: { id: true, reference: true, nom: true } },
  utilisateur: { select: { id: true, email: true, nom: true, prenom: true } },
} as const;

type ScanLogRow = Prisma.ScanLogGetPayload<{ include: typeof SCAN_LOG_INCLUDE }>;

export const scanLogToGraphQL = ({ utilisateur, ...row }: ScanLogRow): ScanLog => ({
  ...row,
  utilisateur: utilisateur
    ? { ...utilisateur, nom: utilisateur.nom ?? undefined, prenom: utilisateur.prenom ?? undefined }
    : undefined,
});

@Injectable()
export class ScansService {
  constructor(private readonly prisma: PrismaService) {}

  async scan(input: ScanInput, user: AuthUser | undefined, fromDevice: boolean): Promise<ScanResult> {
    const reference = input.reference.trim();
    const equipement = await this.prisma.equipement.findUnique({ where: { reference } });
    if (!equipement) throw new NotFoundException(`Aucun équipement ne correspond au code-barres « ${reference} ».`);

    const nouveauStatus = STATUS_PAR_NOMBRE_DE_SCANS[input.nombreScans];
    const [updated] = await this.prisma.$transaction([
      this.prisma.equipement.update({
        where: { id: equipement.id },
        data: { status: nouveauStatus },
        select: { id: true, reference: true, nom: true },
      }),
      this.prisma.scanLog.create({
        data: {
          equipementId: equipement.id,
          utilisateurId: fromDevice ? null : user?.id,
          source: fromDevice ? ScanSource.RASPBERRY : ScanSource.WEB,
          nombreScans: input.nombreScans,
          ancienStatus: equipement.status,
          nouveauStatus,
        },
      }),
    ]);

    return { equipement: updated, ancienStatus: equipement.status, nouveauStatus, nombreScans: input.nombreScans };
  }

  async findLogs(filter: ScanLogsFilter = {}) {
    const where: Prisma.ScanLogWhereInput = {};
    if (filter.equipementId) where.equipementId = filter.equipementId;
    if (filter.source) where.source = filter.source;
    if (filter.search?.trim()) {
      const contains = { contains: filter.search.trim(), mode: 'insensitive' as const };
      where.OR = [
        { equipement: { is: { reference: contains } } },
        { equipement: { is: { nom: contains } } },
        { utilisateur: { is: { email: contains } } },
        { utilisateur: { is: { nom: contains } } },
        { utilisateur: { is: { prenom: contains } } },
      ];
    }
    const rows = await this.prisma.scanLog.findMany({
      where,
      include: SCAN_LOG_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: filter.limit ?? 200,
    });
    return rows.map(scanLogToGraphQL);
  }
}

// ---------- Resolver ----------

@Resolver(() => ScanLog)
export class ScansResolver {
  constructor(private readonly service: ScansService) {}

  @AllowDevice()
  @Roles(Role.OUVRIER, Role.ADMIN)
  @Mutation(() => ScanResult, { description: "Change le statut d'un équipement selon le nombre de scans" })
  scanEquipement(
    @Args('input') input: ScanInput,
    @CurrentUser() user: AuthUser | undefined,
    @IsDevice() fromDevice: boolean,
  ) {
    return this.service.scan(input, user, fromDevice);
  }

  @Roles(Role.ADMIN)
  @Query(() => [ScanLog])
  scanLogs(@Args('filter', { nullable: true }) filter?: ScanLogsFilter) {
    return this.service.findLogs(filter);
  }
}

@Module({
  providers: [ScansService, ScansResolver],
})
export class ScansModule {}
