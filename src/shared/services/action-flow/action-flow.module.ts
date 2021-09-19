import { Module } from '@nestjs/common';

import { CronModule } from '../cron';
import { DefinitionsServiceModule } from '../definitions';
import { MessagingModule } from '../messaging';
import { ParamsServiceModule } from '../params';
import { ReteImporterService } from './services/rete-importer/rete-importer.service';

@Module({
  imports: [ParamsServiceModule, MessagingModule, DefinitionsServiceModule, CronModule],
  providers: [ReteImporterService],
})
export class ActionFlowModule {
  constructor(private readonly _reteImporterService: ReteImporterService) {
    this._reteImporterService.schedule();
  }
}
