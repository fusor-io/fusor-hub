import { Module, BeforeApplicationShutdown } from '@nestjs/common';
import { DatabaseServiceModule } from '../database/database-service.module';
import { ParamsService } from './service/params.service';

@Module({
  imports: [DatabaseServiceModule],
  providers: [ParamsService],
  exports: [ParamsService],
})
export class ParamsServiceModule implements BeforeApplicationShutdown {
  constructor(private readonly _paramsService: ParamsService) {}

  async beforeApplicationShutdown(): Promise<void> {
    await this._paramsService.flushWriteCache();
  }
}
