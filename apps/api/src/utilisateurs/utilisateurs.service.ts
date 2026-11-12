import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcryptjs';
import { handlePrismaError, isObjectId } from '../common/prisma-errors';
import { PrismaService } from '../prisma/prisma.module';
import {
  ChangePasswordInput,
  CreateUtilisateurInput,
  UpdateProfileInput,
  UpdateUtilisateurInput,
  UTILISATEUR_SELECT,
} from './utilisateur.types';

const EMAIL_PRIS = 'Cet email est déjà utilisé.';
const INTROUVABLE = 'Utilisateur introuvable.';

@Injectable()
export class UtilisateursService {
  constructor(private readonly prisma: PrismaService) {}

  hashPassword(password: string) {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  /**
   * Vérifie un mot de passe. Les anciens comptes hachés en bcrypt restent
   * acceptés ; l'appelant peut alors re-hacher en Argon2 (voir AuthService).
   */
  async verifyPassword(hash: string, password: string): Promise<boolean> {
    if (hash.startsWith('$argon2')) return argon2.verify(hash, password);
    if (hash.startsWith('$2')) return bcrypt.compare(password, hash);
    return false;
  }

  findAll(search?: string, role?: Role) {
    const where: Prisma.UtilisateurWhereInput = {};
    if (role) where.role = role;
    if (search?.trim()) {
      const contains = { contains: search.trim(), mode: 'insensitive' as const };
      where.OR = [{ nom: contains }, { prenom: contains }, { email: contains }, { telephone: contains }];
    }
    return this.prisma.utilisateur.findMany({ where, select: UTILISATEUR_SELECT, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const user = isObjectId(id)
      ? await this.prisma.utilisateur.findUnique({ where: { id }, select: UTILISATEUR_SELECT })
      : null;
    if (!user) throw new NotFoundException(INTROUVABLE);
    return user;
  }

  async create(input: CreateUtilisateurInput) {
    const { password, email, ...rest } = input;
    try {
      return await this.prisma.utilisateur.create({
        data: { ...rest, email: email.trim().toLowerCase(), password: await this.hashPassword(password) },
        select: UTILISATEUR_SELECT,
      });
    } catch (e) {
      handlePrismaError(e, EMAIL_PRIS);
    }
  }

  async update(id: string, input: UpdateUtilisateurInput, currentUserId: string) {
    if (id === currentUserId && input.role && input.role !== Role.ADMIN) {
      throw new BadRequestException('Vous ne pouvez pas retirer votre propre rôle administrateur.');
    }
    const { password, email, ...rest } = input;
    const data: Prisma.UtilisateurUpdateInput = { ...rest };
    if (email) data.email = email.trim().toLowerCase();
    if (password) data.password = await this.hashPassword(password);
    try {
      return await this.prisma.utilisateur.update({ where: { id }, data, select: UTILISATEUR_SELECT });
    } catch (e) {
      handlePrismaError(e, EMAIL_PRIS, INTROUVABLE);
    }
  }

  updateProfile(id: string, input: UpdateProfileInput) {
    return this.update(id, input, id);
  }

  async changePassword(id: string, input: ChangePasswordInput) {
    const user = await this.prisma.utilisateur.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(INTROUVABLE);
    if (!(await this.verifyPassword(user.password, input.ancienMotDePasse))) {
      throw new BadRequestException('Le mot de passe actuel est incorrect.');
    }
    await this.prisma.utilisateur.update({
      where: { id },
      data: { password: await this.hashPassword(input.nouveauMotDePasse) },
    });
    return true;
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte.');
    try {
      await this.prisma.utilisateur.delete({ where: { id } });
      return true;
    } catch (e) {
      handlePrismaError(e, '', INTROUVABLE);
    }
  }
}
