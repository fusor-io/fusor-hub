import { Module } from '@nestjs/common';
import { ParamsModule } from 'src/shared/services/params/params.module';
import { AggregatesModule } from 'src/shared/services/aggregates/aggregates.module';

import { NodeController } from './controller/node/node.controller';
import { StorageService } from './service/storage.service';
import { AggregateController } from './controller/aggregate/aggregate.controller';

@Module({
  imports: [ParamsModule, AggregatesModule],
  controllers: [NodeController, AggregateController],
  providers: [StorageService],
})
export class PrimitiveStorageModule {}
