import { Module, forwardRef } from '@nestjs/common';
import { ParamsServiceModule } from 'src/shared/services/params/params-service.module';
import { DatabaseServiceModule } from '../database/database-service.module';
import { AggregatesService } from './service/aggregates.service';

@Module({
  imports: [DatabaseServiceModule, forwardRef( ()=> ParamsServiceModule)],
  providers: [AggregatesService],
  exports: [AggregatesService],
})
export class AggregatesServiceModule {}
