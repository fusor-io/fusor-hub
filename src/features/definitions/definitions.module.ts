import { Module } from '@nestjs/common';

import { DefinitionsServiceModule } from '../../shared/services/definitions';
import { DefinitionsController } from './controller/definitions.controller';

@Module({
  imports: [DefinitionsServiceModule],
  controllers: [DefinitionsController],
})
export class DefinitionsModule {}
