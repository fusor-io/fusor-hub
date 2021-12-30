import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppService } from './app.service';
import { ExportBrokerService } from './shared/services/exporter';
import { Config } from './shared/type';

@Controller()
export class AppController {
  constructor(
    private readonly _appService: AppService,
    private readonly _exportBrokerService: ExportBrokerService,
    private readonly _configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this._appService.getHello();
  }

  @Get('/reload')
  async reload(): Promise<void> {
    await this._exportBrokerService.reload(true);
  }

  @Get('/fb-config')
  fbConfig(): Record<string, string> {
    return {
      projectId: this._configService.get(Config.googleCloudProjectId),
      projectNumber: this._configService.get(Config.googleCloudProjectNumber),
      apiKey: this._configService.get(Config.googleCloudApiKey),
    };
  }
}
