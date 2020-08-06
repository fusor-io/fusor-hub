import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DefinitionsServiceModule } from 'src/shared/services/definitions/definitions-service.module';

import { GoogleSignInService } from './service/google-sign-in.service';

@Module({
  imports: [ConfigModule, DefinitionsServiceModule],
  providers: [GoogleSignInService],
  exports: [GoogleSignInService],
})
export class GoogleSignInServiceModule {}
