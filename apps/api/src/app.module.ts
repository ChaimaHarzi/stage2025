import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { GraphQLFormattedError } from 'graphql';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ClassificationsModule } from './classifications/classifications.module';
import { AuthGuard } from './common/auth.guard';
import { EquipementsModule } from './equipements/equipements.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScansModule } from './scans/scans.module';
import { StatsModule } from './stats/stats.module';
import { UtilisateursModule } from './utilisateurs/utilisateurs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) throw new Error('JWT_SECRET manquant dans apps/api/.env');
        return { secret, signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '8h') } };
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      context: ({ req }: { req: unknown }) => ({ req }),
      // Ne renvoie au client que le message et le code, jamais la stacktrace.
      formatError: (error): GraphQLFormattedError => ({
        message: error.message,
        path: error.path,
        extensions: { code: error.extensions?.code },
      }),
    }),
    PrismaModule,
    AuthModule,
    UtilisateursModule,
    ClassificationsModule,
    EquipementsModule,
    ScansModule,
    StatsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
