import { Module } from '@nestjs/common';
import { NodeController } from './controller/node/node.controller';
import { StorageService } from './service/storage.service';
import { DatabaseModule } from 'src/shared/services/database/database.module';
import { AggregateController } from './controller/aggregate/aggregate.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [NodeController, AggregateController],
  providers: [StorageService],
})
export class StorageModule {}
