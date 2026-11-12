import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Traduit les erreurs Prisma courantes en erreurs métier lisibles.
 * @param uniqueMessage message affiché quand une contrainte d'unicité est violée
 */
export function handlePrismaError(error: unknown, uniqueMessage: string, notFoundMessage = 'Élément introuvable.'): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') throw new ConflictException(uniqueMessage);
    if (error.code === 'P2025') throw new NotFoundException(notFoundMessage);
    if (error.code === 'P2023') throw new NotFoundException(notFoundMessage); // identifiant ObjectId mal formé
  }
  throw error;
}

/** Vérifie qu'une chaîne est un ObjectId MongoDB (24 caractères hexadécimaux). */
export const isObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);
