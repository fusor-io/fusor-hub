import { Module } from '@nestjs/common';
import { ParamsServiceModule } from 'src/shared/services/params/params-service.module';
import { AggregatesServiceModule } from 'src/shared/services/aggregates/aggregates-service.module';
import { FirebaseModule } from 'src/shared/services/firebase/firebase.module';

import { NodeController } from './controller/node/node.controller';
import { StorageService } from './service/storage.service';
import { AggregateController } from './controller/aggregate/aggregate.controller';

@Module({
  imports: [ParamsServiceModule, AggregatesServiceModule, FirebaseModule],
  controllers: [NodeController, AggregateController],
  providers: [StorageService],
})
export class PrimitiveStorageModule {}
