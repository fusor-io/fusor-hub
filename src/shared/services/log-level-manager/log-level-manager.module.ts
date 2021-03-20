import { Module, OnModuleInit } from '@nestjs/common';

import { CronModule } from '../cron/cron.module';
import { ParamsServiceModule } from '../params/params-service.module';
import { LogLevelManagerService } from './service/log-level-manager.service';

@Module({
  imports: [ParamsServiceModule, CronModule],
  providers: [LogLevelManagerService],
})
export class LogLevelManagerModule implements OnModuleInit {
  constructor(private readonly _logLevelManager: LogLevelManagerService) {}

  onModuleInit() {
    // start with delay
    setTimeout(() => this._logLevelManager.scheduleLevelUpdate(), 10000);
  }
}
