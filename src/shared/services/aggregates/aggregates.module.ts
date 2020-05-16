import { Module } from '@nestjs/common';
import { AggregatesService } from './service/aggregates.service';
import { DatabaseService } from '../database/service/database.service';
import { ParamsService } from '../params/service/params.service';

@Module({
  imports: [DatabaseService, ParamsService],
  providers: [AggregatesService],
  exports: [AggregatesService],
})
export class AggregatesModule {}
