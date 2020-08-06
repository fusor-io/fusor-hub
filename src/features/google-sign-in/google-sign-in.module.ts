import { Module } from '@nestjs/common';
import { GoogleSignInServiceModule } from 'src/shared/services/google-sign-in/google-sign-in.module';

import { GoogleSignInController } from './controller/google-sign-in.controller';

/**
 * @see https://console.developers.google.com/apis/credentials
 */

@Module({
  imports: [GoogleSignInServiceModule],
  controllers: [GoogleSignInController],
})
export class GoogleSignInModule {}
