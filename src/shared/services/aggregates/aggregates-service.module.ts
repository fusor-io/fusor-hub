import { forwardRef, Module } from '@nestjs/common';

import { DatabaseServiceModule } from '../database';
import { ParamsServiceModule } from '../params';
import { AggregatesService } from './service/aggregates.service';

@Module({
  imports: [DatabaseServiceModule, forwardRef( ()=> ParamsServiceModule)],
  providers: [AggregatesService],
  exports: [AggregatesService],
})
export class AggregatesServiceModule {}
