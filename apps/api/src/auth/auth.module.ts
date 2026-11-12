import { Injectable, Module, UnauthorizedException } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { Public } from '../common/auth.guard';
import { PrismaService } from '../prisma/prisma.module';
import { AuthPayload, LoginInput, SignUpInput, UTILISATEUR_SELECT, Utilisateur } from '../utilisateurs/utilisateur.types';
import { UtilisateursModule } from '../utilisateurs/utilisateurs.module';
import { UtilisateursService } from '../utilisateurs/utilisateurs.service';

const IDENTIFIANTS_INVALIDES = 'Email ou mot de passe incorrect.';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly utilisateurs: UtilisateursService,
  ) {}

  async login({ email, password }: LoginInput): Promise<AuthPayload> {
    const user = await this.prisma.utilisateur.findUnique({ where: { email: email.trim().toLowerCase() } });
    // Même message que l'email existe ou non, pour ne pas révéler les comptes existants.
    if (!user || !(await this.utilisateurs.verifyPassword(user.password, password))) {
      throw new UnauthorizedException(IDENTIFIANTS_INVALIDES);
    }
    // Migration transparente des anciens hachages bcrypt vers Argon2.
    if (!user.password.startsWith('$argon2')) {
      await this.prisma.utilisateur.update({
        where: { id: user.id },
        data: { password: await this.utilisateurs.hashPassword(password) },
      });
    }
    const utilisateur = await this.prisma.utilisateur.findUniqueOrThrow({
      where: { id: user.id },
      select: UTILISATEUR_SELECT,
    });
    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return { accessToken, utilisateur: utilisateur as Utilisateur };
  }

  /** Inscription publique : le rôle est imposé à OUVRIER côté serveur. */
  signUp(input: SignUpInput) {
    return this.utilisateurs.create({ ...input, role: Role.OUVRIER });
  }
}

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Mutation(() => AuthPayload)
  login(@Args('input') input: LoginInput) {
    return this.auth.login(input);
  }

  @Public()
  @Mutation(() => Utilisateur)
  signUp(@Args('input') input: SignUpInput) {
    return this.auth.signUp(input);
  }
}

@Module({
  imports: [UtilisateursModule],
  providers: [AuthService, AuthResolver],
})
export class AuthModule {}
