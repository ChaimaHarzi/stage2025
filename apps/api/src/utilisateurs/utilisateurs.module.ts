import { Module } from '@nestjs/common';
import { UtilisateursResolver } from './utilisateurs.resolver';
import { UtilisateursService } from './utilisateurs.service';

@Module({
  providers: [UtilisateursService, UtilisateursResolver],
  exports: [UtilisateursService],
})
export class UtilisateursModule {}
