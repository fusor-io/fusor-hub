import { Module } from '@nestjs/common';
import { DefinitionsModule } from 'src/features/definitions/definitions.module';

import { ParamsServiceModule } from '../params/params-service.module';
import { ReteImporterService } from './services/rete-importer/rete-importer.service';

@Module({
  imports: [ParamsServiceModule, DefinitionsModule],
  providers: [ReteImporterService],
})
export class ActionFlowModule {}
