import { Module } from '@nestjs/common';
import { DatabaseServiceModule } from '../database/database-service.module';
import { ParamsService } from './service/params.service';

@Module({
  imports: [DatabaseServiceModule],
  providers: [ParamsService],
  exports: [ParamsService],
})
export class ParamsServiceModule {}
