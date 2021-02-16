import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { ExportBrokerService } from './shared/services/exporter/services/broker/broker.service';

@Controller()
export class AppController {
  constructor(
    private readonly _appService: AppService,
    private readonly _exportBrokerService: ExportBrokerService,
  ) {}

  @Get()
  getHello(): string {
    return this._appService.getHello();
  }

  @Get("/reload")
  async reload(): Promise<void> {
    await this._exportBrokerService.reload();
  }
}
