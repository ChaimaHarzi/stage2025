/**
 * Catégories (sprint 3) et familles (sprint 4) d'équipements.
 * Les deux entités ont exactement la même structure : une seule implémentation
 * générique est exposée sous deux types GraphQL distincts.
 */
import { BadRequestException, Injectable, Module, NotFoundException } from '@nestjs/common';
import { Args, Field, ID, InputType, Int, Mutation, ObjectType, PartialType, Query, Resolver } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { Roles } from '../common/auth.guard';
import { Role } from '../common/enums';
import { handlePrismaError, isObjectId } from '../common/prisma-errors';
import { PrismaService } from '../prisma/prisma.module';

export const COULEURS = ['blue', 'green', 'purple', 'orange', 'pink', 'indigo'] as const;

// ---------- Types GraphQL ----------

@ObjectType({ isAbstract: true })
abstract class ClassificationBase {
  @Field(() => ID) id: string;
  @Field() nom: string;
  @Field({ nullable: true }) description?: string;
  @Field() couleur: string;
  @Field(() => Int, { description: "Nombre d'équipements rattachés" }) nombreEquipements: number;
  @Field() createdAt: Date;
}

@ObjectType() export class Categorie extends ClassificationBase {}
@ObjectType() export class Famille extends ClassificationBase {}

@InputType()
export class ClassificationInput {
  @Field()
  @IsNotEmpty({ message: 'Veuillez saisir le nom.' })
  @MaxLength(60, { message: 'Le nom ne doit pas dépasser 60 caractères.' })
  nom: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(300, { message: 'La description ne doit pas dépasser 300 caractères.' })
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsIn(COULEURS, { message: 'Couleur invalide.' })
  couleur?: string;
}

@InputType()
export class UpdateClassificationInput extends PartialType(ClassificationInput) {}

// ---------- Service générique ----------

type Kind = 'categorie' | 'famille';

const LIBELLES: Record<Kind, { nom: string; existe: string; introuvable: string }> = {
  categorie: {
    nom: 'cette catégorie',
    existe: 'Une catégorie avec ce nom existe déjà.',
    introuvable: 'Catégorie introuvable.',
  },
  famille: {
    nom: 'cette famille',
    existe: 'Une famille avec ce nom existe déjà.',
    introuvable: 'Famille introuvable.',
  },
};

interface ClassificationRow {
  id: string;
  nom: string;
  description: string | null;
  couleur: string;
  createdAt: Date;
  _count: { equipements: number };
}

const toGraphQL = ({ _count, description, ...row }: ClassificationRow) => ({
  ...row,
  description: description ?? undefined,
  nombreEquipements: _count.equipements,
});

const INCLUDE_COUNT = { _count: { select: { equipements: true } } } as const;

class ClassificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kind: Kind,
  ) {}

  /** Les délégués Prisma `categorie` et `famille` ont des signatures identiques. */
  private get db(): PrismaService['categorie'] {
    return this.prisma[this.kind] as PrismaService['categorie'];
  }

  private get libelle() {
    return LIBELLES[this.kind];
  }

  async findAll(search?: string) {
    const where = search?.trim()
      ? {
          OR: [
            { nom: { contains: search.trim(), mode: 'insensitive' as const } },
            { description: { contains: search.trim(), mode: 'insensitive' as const } },
          ],
        }
      : {};
    const rows = await this.db.findMany({ where, include: INCLUDE_COUNT, orderBy: { nom: 'asc' } });
    return rows.map(toGraphQL);
  }

  async create(input: ClassificationInput) {
    try {
      return toGraphQL(await this.db.create({ data: { ...input, nom: input.nom.trim() }, include: INCLUDE_COUNT }));
    } catch (e) {
      handlePrismaError(e, this.libelle.existe);
    }
  }

  async update(id: string, input: UpdateClassificationInput) {
    try {
      const data = input.nom ? { ...input, nom: input.nom.trim() } : input;
      return toGraphQL(await this.db.update({ where: { id }, data, include: INCLUDE_COUNT }));
    } catch (e) {
      handlePrismaError(e, this.libelle.existe, this.libelle.introuvable);
    }
  }

  /** Refuse la suppression si des équipements y sont encore rattachés. */
  async remove(id: string) {
    const row = isObjectId(id) ? await this.db.findUnique({ where: { id }, include: INCLUDE_COUNT }) : null;
    if (!row) throw new NotFoundException(this.libelle.introuvable);
    const n = row._count.equipements;
    if (n > 0) {
      throw new BadRequestException(
        `Impossible de supprimer ${this.libelle.nom} : ${n} équipement(s) y sont rattachés. Réaffectez-les d'abord.`,
      );
    }
    await this.db.delete({ where: { id } });
    return true;
  }
}

@Injectable()
export class CategoriesService extends ClassificationService {
  constructor(prisma: PrismaService) {
    super(prisma, 'categorie');
  }
}

@Injectable()
export class FamillesService extends ClassificationService {
  constructor(prisma: PrismaService) {
    super(prisma, 'famille');
  }
}

// ---------- Resolvers (administrateur uniquement) ----------

@Roles(Role.ADMIN)
@Resolver(() => Categorie)
export class CategoriesResolver {
  constructor(private readonly service: CategoriesService) {}

  @Query(() => [Categorie])
  categories(@Args('search', { nullable: true }) search?: string) {
    return this.service.findAll(search);
  }

  @Mutation(() => Categorie)
  createCategorie(@Args('input') input: ClassificationInput) {
    return this.service.create(input);
  }

  @Mutation(() => Categorie)
  updateCategorie(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateClassificationInput) {
    return this.service.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteCategorie(@Args('id', { type: () => ID }) id: string) {
    return this.service.remove(id);
  }
}

@Roles(Role.ADMIN)
@Resolver(() => Famille)
export class FamillesResolver {
  constructor(private readonly service: FamillesService) {}

  @Query(() => [Famille])
  familles(@Args('search', { nullable: true }) search?: string) {
    return this.service.findAll(search);
  }

  @Mutation(() => Famille)
  createFamille(@Args('input') input: ClassificationInput) {
    return this.service.create(input);
  }

  @Mutation(() => Famille)
  updateFamille(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateClassificationInput) {
    return this.service.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteFamille(@Args('id', { type: () => ID }) id: string) {
    return this.service.remove(id);
  }
}

@Module({
  providers: [CategoriesService, FamillesService, CategoriesResolver, FamillesResolver],
})
export class ClassificationsModule {}
