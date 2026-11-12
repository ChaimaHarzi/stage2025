import { Field, ID, InputType, ObjectType, OmitType, PartialType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Matches,
  MaxDate,
  MinLength,
} from 'class-validator';
import { Genre, Role } from '../common/enums';

// ---------- Types renvoyés ----------

@ObjectType()
export class Utilisateur {
  @Field(() => ID) id: string;
  @Field() email: string;
  @Field({ nullable: true }) nom?: string;
  @Field({ nullable: true }) prenom?: string;
  @Field({ nullable: true }) telephone?: string;
  @Field(() => Genre, { nullable: true }) genre?: Genre;
  @Field({ nullable: true }) dateDeNaissance?: Date;
  @Field(() => Role) role: Role;
  @Field() createdAt: Date;
}

@ObjectType()
export class AuthPayload {
  @Field() accessToken: string;
  @Field(() => Utilisateur) utilisateur: Utilisateur;
}

/** Champs à sélectionner en base : tout sauf le mot de passe. */
export const UTILISATEUR_SELECT = {
  id: true,
  email: true,
  nom: true,
  prenom: true,
  telephone: true,
  genre: true,
  dateDeNaissance: true,
  role: true,
  createdAt: true,
} as const;

// ---------- Règles de validation partagées ----------

const PASSWORD_RULE = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const PASSWORD_MESSAGE = 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre.';

/** Date limite pour avoir 18 ans aujourd'hui. */
const majorite = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d;
};

// ---------- Entrées ----------

@InputType()
export class LoginInput {
  @Field()
  @IsEmail({}, { message: 'Veuillez saisir une adresse email valide.' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Veuillez saisir votre mot de passe.' })
  password: string;
}

/** Inscription publique : le compte créé est toujours un compte ouvrier. */
@InputType()
export class SignUpInput {
  @Field()
  @IsNotEmpty({ message: 'Veuillez saisir le nom.' })
  nom: string;

  @Field()
  @IsNotEmpty({ message: 'Veuillez saisir le prénom.' })
  prenom: string;

  @Field()
  @Matches(/^\d{8,15}$/, { message: 'Le numéro de téléphone doit contenir uniquement des chiffres (8 à 15).' })
  telephone: string;

  @Field()
  @IsEmail({}, { message: 'Veuillez saisir une adresse email valide.' })
  email: string;

  @Field()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
  @Matches(PASSWORD_RULE, { message: PASSWORD_MESSAGE })
  password: string;

  @Field(() => Genre)
  @IsEnum(Genre, { message: 'Veuillez sélectionner un genre.' })
  genre: Genre;

  @Field()
  @Type(() => Date)
  @IsDate({ message: 'Veuillez saisir une date de naissance valide.' })
  @MaxDate(majorite, { message: 'La personne doit avoir au moins 18 ans.' })
  dateDeNaissance: Date;
}

/** Création d'un compte par l'administrateur : il choisit le rôle. */
@InputType()
export class CreateUtilisateurInput extends SignUpInput {
  @Field(() => Role)
  @IsEnum(Role, { message: 'Rôle invalide.' })
  role: Role;
}

/** Modification par l'administrateur ; le mot de passe est optionnel (réinitialisation). */
@InputType()
export class UpdateUtilisateurInput extends PartialType(CreateUtilisateurInput) {}

/** Modification de son propre profil (sans rôle ni mot de passe). */
@InputType()
export class UpdateProfileInput extends PartialType(OmitType(SignUpInput, ['password'] as const)) {}

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsNotEmpty({ message: 'Veuillez saisir votre mot de passe actuel.' })
  ancienMotDePasse: string;

  @Field()
  @MinLength(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' })
  @Matches(PASSWORD_RULE, { message: PASSWORD_MESSAGE })
  nouveauMotDePasse: string;
}
