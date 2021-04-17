import { HttpService, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { inspect } from 'util';

import { Config } from '../../../../shared/type';

@Injectable()
export class MessagingService {
  private readonly _logger = new Logger(this.constructor.name);
  private readonly _apiUrl = this._configService.get<string>(Config.messenteUrl);
  private readonly _sender = this._configService.get<string>(Config.messenteSender);

  constructor(
    private readonly _configService: ConfigService,
    private readonly _httpService: HttpService,
  ) {}

  async send(recipient: string, text: string): Promise<boolean> {
    if (!this._apiUrl) {
      this._logger.error('Api url is not configure');
      return false;
    }

    if (!this._sender) {
      this._logger.error('Sender is not configured');
      return false;
    }

    if (!recipient || !text) {
      this._logger.error('No recipient or text provided');
      return false;
    }

    const header = this._authHeader;
    if (!header) {
      this._logger.error('Missing auth user or/and password');
      return false;
    }

    try {
      const result = await this._httpService
        .post(
          this._apiUrl,
          {
            to: recipient,
            messages: [
              {
                channel: 'sms',
                sender: this._sender,
                text: text,
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${header}`,
            },
          },
        )
        .toPromise();

      this._logger.log(
        `Message "${text}" have been sent to ${recipient}: ${inspect({ data: result.data })}`,
      );

      return true;
    } catch (error) {
      this._logger.error(`Failed sending message "${text} to "${recipient}": ${inspect(error)}`);
      return false;
    }
  }

  private get _authHeader(): string | undefined {
    const user = this._configService.get<string>(Config.messenteUser);
    const password = this._configService.get<string>(Config.messentePassword);

    if (!user || !password) return undefined;

    return Buffer.from(`${user}:${password}`).toString('base64');
  }
}
