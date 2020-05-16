import { Module } from '@nestjs/common';
import { ParamsModule } from 'src/shared/services/params/params.module';
import { DatabaseModule } from '../database/database.module';
import { AggregatesService } from './service/aggregates.service';

@Module({
  imports: [DatabaseModule, ParamsModule],
  providers: [AggregatesService],
  exports: [AggregatesService],
})
export class AggregatesModule {}
