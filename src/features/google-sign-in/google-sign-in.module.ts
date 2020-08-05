import { Module } from '@nestjs/common';
import { DefinitionsServiceModule } from 'src/shared/services/definitions/definitions-service.module';

import { GoogleSignInController } from './controller/google-sign-in.controller';
import { GoogleSignInService } from './service/google-sign-in.service';


/**
 * @see https://console.developers.google.com/apis/credentials
 */

@Module({
  imports: [DefinitionsServiceModule],
  controllers: [GoogleSignInController],
  providers: [GoogleSignInService]
})
export class GoogleSignInModule {}
