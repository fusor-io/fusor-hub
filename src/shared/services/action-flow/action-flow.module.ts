import { Module } from '@nestjs/common';
import { DefinitionsModule } from 'src/features/definitions/definitions.module';

import { ParamsServiceModule } from '../params/params-service.module';
import { ActionFlowService } from './services/action-flow/action-flow.service';
import { ReteImporterService } from './services/rete-importer/rete-importer.service';

@Module({
  imports: [ParamsServiceModule, DefinitionsModule],
  providers: [ActionFlowService, ReteImporterService],
  exports: [ActionFlowService],
})
export class ActionFlowModule {
  constructor(private readonly _actionFlowService: ActionFlowService) {}
}
