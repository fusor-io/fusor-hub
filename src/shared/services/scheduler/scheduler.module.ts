import { Module, OnModuleInit } from '@nestjs/common';
import { ParamsServiceModule } from 'src/shared/services/params/params-service.module';
import { FirebaseModule } from 'src/shared/services/firebase/firebase.module';
import { AggregatesServiceModule } from 'src/shared/services/aggregates/aggregates-service.module';
import { SchedulerService } from './service/scheduler.service';

@Module({
  imports: [AggregatesServiceModule, ParamsServiceModule, FirebaseModule],
  providers: [SchedulerService],
})
export class SchedulerModule implements OnModuleInit {
  constructor(private readonly _schedulerService: SchedulerService) {}
  onModuleInit() {
    this._schedulerService.scheduleJobs();
  }
}
