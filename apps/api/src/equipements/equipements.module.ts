/** Gestion des équipements (sprint 2). */
import { BadRequestException, Injectable, Module, NotFoundException } from '@nestjs/common';
import { Args, Field, ID, InputType, Mutation, ObjectType, PartialType, Query, Resolver } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, Matches, MaxLength } from 'class-validator';
import { Roles } from '../common/auth.guard';
import { Role, Status } from '../common/enums';
import { handlePrismaError, isObjectId } from '../common/prisma-errors';
import { PrismaService } from '../prisma/prisma.module';

// ---------- Types GraphQL ----------

@ObjectType()
export class ClassificationResume {
  @Field(() => ID) id: string;
  @Field() nom: string;
  @Field() couleur: string;
}

@ObjectType()
export class Equipement {
  @Field(() => ID) id: string;
  @Field({ description: 'Référence encodée dans le code-barres' }) reference: string;
  @Field() nom: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Status) status: Status;
  @Field(() => ClassificationResume) categorie: ClassificationResume;
  @Field(() => ClassificationResume) famille: ClassificationResume;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}

/** Vue restreinte pour l'ouvrier : nom et statut uniquement (+ référence pour le scan). */
@ObjectType()
export class EquipementOuvrier {
  @Field(() => ID) id: string;
  @Field() reference: string;
  @Field() nom: string;
  @Field(() => Status) status: Status;
  @Field() updatedAt: Date;
}

@InputType()
export class EquipementInput {
  @Field()
  @Matches(/^[A-Za-z0-9._-]{2,40}$/, {
    message: 'La référence doit contenir 2 à 40 caractères (lettres, chiffres, « - », « _ », « . »).',
  })
  reference: string;

  @Field()
  @IsNotEmpty({ message: 'Le nom est requis.' })
  @MaxLength(100, { message: 'Le nom ne doit pas dépasser 100 caractères.' })
  nom: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(500, { message: 'La description ne doit pas dépasser 500 caractères.' })
  description?: string;

  @Field(() => Status, { nullable: true })
  @IsOptional()
  @IsEnum(Status, { message: 'Statut invalide.' })
  status?: Status;

  @Field(() => ID)
  @IsMongoId({ message: 'Veuillez sélectionner une catégorie.' })
  categorieId: string;

  @Field(() => ID)
  @IsMongoId({ message: 'Veuillez sélectionner une famille.' })
  familleId: string;
}

@InputType()
export class UpdateEquipementInput extends PartialType(EquipementInput) {}

// ---------- Service ----------

const REFERENCE_PRISE = 'Un équipement avec cette référence existe déjà.';
const INTROUVABLE = 'Équipement introuvable.';

const INCLUDE = {
  categorie: { select: { id: true, nom: true, couleur: true } },
  famille: { select: { id: true, nom: true, couleur: true } },
} as const;

type EquipementRow = Prisma.EquipementGetPayload<{ include: typeof INCLUDE }>;

const toGraphQL = ({ description, ...row }: EquipementRow): Equipement => ({
  ...row,
  description: description ?? undefined,
});

@Injectable()
export class EquipementsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(search?: string, status?: Status, categorieId?: string, familleId?: string) {
    const where: Prisma.EquipementWhereInput = {};
    if (status) where.status = status;
    if (categorieId) where.categorieId = categorieId;
    if (familleId) where.familleId = familleId;
    if (search?.trim()) {
      const contains = { contains: search.trim(), mode: 'insensitive' as const };
      where.OR = [{ reference: contains }, { nom: contains }, { description: contains }];
    }
    return where;
  }

  async findAll(search?: string, status?: Status, categorieId?: string, familleId?: string) {
    const rows = await this.prisma.equipement.findMany({
      where: this.buildWhere(search, status, categorieId, familleId),
      include: INCLUDE,
      orderBy: { reference: 'asc' },
    });
    return rows.map(toGraphQL);
  }

  findAllForOuvrier(search?: string, status?: Status) {
    return this.prisma.equipement.findMany({
      where: this.buildWhere(search, status),
      select: { id: true, reference: true, nom: true, status: true, updatedAt: true },
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: string) {
    const row = isObjectId(id) ? await this.prisma.equipement.findUnique({ where: { id }, include: INCLUDE }) : null;
    if (!row) throw new NotFoundException(INTROUVABLE);
    return toGraphQL(row);
  }

  /** MongoDB n'impose pas les clés étrangères : on vérifie les rattachements nous-mêmes. */
  private async checkLinks(categorieId?: string, familleId?: string) {
    if (categorieId && !(await this.prisma.categorie.findUnique({ where: { id: categorieId } }))) {
      throw new BadRequestException("La catégorie sélectionnée n'existe pas.");
    }
    if (familleId && !(await this.prisma.famille.findUnique({ where: { id: familleId } }))) {
      throw new BadRequestException("La famille sélectionnée n'existe pas.");
    }
  }

  async create(input: EquipementInput) {
    await this.checkLinks(input.categorieId, input.familleId);
    try {
      return toGraphQL(
        await this.prisma.equipement.create({
          data: { ...input, reference: input.reference.trim(), nom: input.nom.trim() },
          include: INCLUDE,
        }),
      );
    } catch (e) {
      handlePrismaError(e, REFERENCE_PRISE);
    }
  }

  async update(id: string, input: UpdateEquipementInput) {
    await this.checkLinks(input.categorieId, input.familleId);
    try {
      return toGraphQL(await this.prisma.equipement.update({ where: { id }, data: input, include: INCLUDE }));
    } catch (e) {
      handlePrismaError(e, REFERENCE_PRISE, INTROUVABLE);
    }
  }

  /** Supprime l'équipement ; son historique de scans est supprimé en cascade. */
  async remove(id: string) {
    try {
      await this.prisma.equipement.delete({ where: { id } });
      return true;
    } catch (e) {
      handlePrismaError(e, '', INTROUVABLE);
    }
  }
}

// ---------- Resolver ----------

@Resolver(() => Equipement)
export class EquipementsResolver {
  constructor(private readonly service: EquipementsService) {}

  @Roles(Role.ADMIN)
  @Query(() => [Equipement])
  equipements(
    @Args('search', { nullable: true }) search?: string,
    @Args('status', { type: () => Status, nullable: true }) status?: Status,
    @Args('categorieId', { type: () => ID, nullable: true }) categorieId?: string,
    @Args('familleId', { type: () => ID, nullable: true }) familleId?: string,
  ) {
    return this.service.findAll(search, status, categorieId, familleId);
  }

  @Roles(Role.ADMIN)
  @Query(() => Equipement)
  equipement(@Args('id', { type: () => ID }) id: string) {
    return this.service.findOne(id);
  }

  @Roles(Role.OUVRIER, Role.ADMIN)
  @Query(() => [EquipementOuvrier], { description: 'Liste restreinte (nom et statut) pour les ouvriers' })
  equipementsOuvrier(
    @Args('search', { nullable: true }) search?: string,
    @Args('status', { type: () => Status, nullable: true }) status?: Status,
  ) {
    return this.service.findAllForOuvrier(search, status);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => Equipement)
  createEquipement(@Args('input') input: EquipementInput) {
    return this.service.create(input);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => Equipement)
  updateEquipement(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateEquipementInput) {
    return this.service.update(id, input);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => Boolean)
  deleteEquipement(@Args('id', { type: () => ID }) id: string) {
    return this.service.remove(id);
  }
}

@Module({
  providers: [EquipementsService, EquipementsResolver],
})
export class EquipementsModule {}
