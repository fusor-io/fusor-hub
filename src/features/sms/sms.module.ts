import { Module } from '@nestjs/common';

import { MessagingModule } from '../../shared/services/messaging';
import { SmsController } from './controller/sms.controller';

@Module({
  imports: [MessagingModule],
  controllers: [SmsController]
})
export class SmsModule {}
