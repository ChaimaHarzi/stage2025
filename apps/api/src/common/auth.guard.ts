import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.module';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

interface RequestWithAuth {
  headers: Record<string, string | string[] | undefined>;
  user?: AuthUser;
  device?: boolean;
}

const PUBLIC_KEY = 'isPublic';
const ROLES_KEY = 'roles';
const DEVICE_KEY = 'allowDevice';

/** Opération accessible sans authentification (connexion, inscription). */
export const Public = () => SetMetadata(PUBLIC_KEY, true);
/** Restreint l'opération aux rôles listés. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
/** Autorise aussi le système embarqué (Raspberry Pi) via l'en-tête x-device-key. */
export const AllowDevice = () => SetMetadata(DEVICE_KEY, true);

export const getRequest = (context: ExecutionContext): RequestWithAuth =>
  GqlExecutionContext.create(context).getContext().req;

/** Utilisateur authentifié (undefined pour un appel du système embarqué). */
export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => getRequest(context).user,
);

/** true si l'appel provient du système embarqué. */
export const IsDevice = createParamDecorator(
  (_: unknown, context: ExecutionContext) => getRequest(context).device === true,
);

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/**
 * Garde globale : toute opération exige un JWT valide, sauf @Public().
 * L'utilisateur est relu en base à chaque requête, donc un compte supprimé
 * ou dont le rôle a changé est pris en compte immédiatement.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, targets)) return true;

    const req = getRequest(context);

    const deviceKey = req.headers['x-device-key'];
    const expectedKey = process.env.DEVICE_API_KEY;
    if (
      typeof deviceKey === 'string' &&
      expectedKey &&
      this.reflector.getAllAndOverride<boolean>(DEVICE_KEY, targets)
    ) {
      if (!safeEqual(deviceKey, expectedKey)) throw new UnauthorizedException('Clé du système embarqué invalide.');
      req.device = true;
      return true;
    }

    const header = req.headers['authorization'];
    const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new UnauthorizedException('Authentification requise.');

    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Session expirée, veuillez vous reconnecter.');
    }

    const user = await this.prisma.utilisateur.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true },
    });
    if (!user) throw new UnauthorizedException('Compte introuvable.');
    req.user = user;

    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, targets);
    if (roles?.length && !roles.includes(user.role)) {
      throw new ForbiddenException("Vous n'avez pas les droits pour cette action.");
    }
    return true;
  }
}
