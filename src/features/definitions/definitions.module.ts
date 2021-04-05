import { Module } from '@nestjs/common';

import { DefinitionsServiceModule } from './../../shared/services/definitions/definitions-service.module';
import { DefinitionsController } from './controller/definitions.controller';

@Module({
  imports: [DefinitionsServiceModule],
  controllers: [DefinitionsController],
})
export class DefinitionsModule {}
