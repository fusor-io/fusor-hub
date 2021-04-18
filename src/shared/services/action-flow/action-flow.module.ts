import { Module } from '@nestjs/common';

import { CronModule } from '../cron';
import { DefinitionsServiceModule } from '../definitions';
import { MessagingModule } from '../messaging';
import { ParamsServiceModule } from '../params/params-service.module';
import { ReteImporterService } from './services/rete-importer/rete-importer.service';

@Module({
  imports: [ParamsServiceModule, DefinitionsServiceModule, CronModule, MessagingModule],
  providers: [ReteImporterService],
})
export class ActionFlowModule {
  constructor(private readonly _reteImporterService: ReteImporterService) {
    this._reteImporterService.schedule();
  }
}
