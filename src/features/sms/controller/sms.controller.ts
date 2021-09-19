import { Body, Controller, Post } from '@nestjs/common';

import { MessagingService } from '../../../shared/services/messaging';
import { SmsQueryDto, SmsResponse } from '../type';

@Controller('sms')
export class SmsController {
  constructor(private readonly _messagingService: MessagingService) {}

  @Post('')
  async sendSms(@Body() body: SmsQueryDto): Promise<SmsResponse> {
    const status = await this._messagingService.send(body.recipient, body.text);
    return { status };
  }
}
