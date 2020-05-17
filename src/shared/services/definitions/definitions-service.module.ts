import { DatabaseServiceModule } from '../database/database-service.module';
import { Module } from '@nestjs/common';
import { DefinitionsService } from './service/definitions.service';

@Module({
  imports: [DatabaseServiceModule],
  providers: [DefinitionsService],
  exports: [DefinitionsService],
})
export class DefinitionsServiceModule {}
