import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser, CurrentUser, Roles } from '../common/auth.guard';
import { Role } from '../common/enums';
import {
  ChangePasswordInput,
  CreateUtilisateurInput,
  UpdateProfileInput,
  UpdateUtilisateurInput,
  Utilisateur,
} from './utilisateur.types';
import { UtilisateursService } from './utilisateurs.service';

@Resolver(() => Utilisateur)
export class UtilisateursResolver {
  constructor(private readonly service: UtilisateursService) {}

  // ----- Profil de l'utilisateur connecté (admin et ouvrier) -----

  @Query(() => Utilisateur, { description: "Profil de l'utilisateur connecté" })
  me(@CurrentUser() user: AuthUser) {
    return this.service.findOne(user.id);
  }

  @Mutation(() => Utilisateur)
  updateProfile(@CurrentUser() user: AuthUser, @Args('input') input: UpdateProfileInput) {
    return this.service.updateProfile(user.id, input);
  }

  @Mutation(() => Boolean)
  changePassword(@CurrentUser() user: AuthUser, @Args('input') input: ChangePasswordInput) {
    return this.service.changePassword(user.id, input);
  }

  // ----- Gestion des utilisateurs (administrateur) -----

  @Roles(Role.ADMIN)
  @Query(() => [Utilisateur])
  utilisateurs(
    @Args('search', { nullable: true }) search?: string,
    @Args('role', { type: () => Role, nullable: true }) role?: Role,
  ) {
    return this.service.findAll(search, role);
  }

  @Roles(Role.ADMIN)
  @Query(() => Utilisateur)
  utilisateur(@Args('id', { type: () => ID }) id: string) {
    return this.service.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => Utilisateur)
  createUtilisateur(@Args('input') input: CreateUtilisateurInput) {
    return this.service.create(input);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => Utilisateur)
  updateUtilisateur(
    @CurrentUser() user: AuthUser,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUtilisateurInput,
  ) {
    return this.service.update(id, input, user.id);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => Boolean)
  deleteUtilisateur(@CurrentUser() user: AuthUser, @Args('id', { type: () => ID }) id: string) {
    return this.service.remove(id, user.id);
  }
}
