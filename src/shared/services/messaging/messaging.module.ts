import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MessagingService } from './service/messaging.service';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
