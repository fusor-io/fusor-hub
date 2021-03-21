import { Module } from '@nestjs/common';

import { ParamsServiceModule } from '../params/params-service.module';
import { ActionFlowService } from './services/action-flow.service';

@Module({
  imports: [ParamsServiceModule],
  providers: [ActionFlowService],
  exports: [ActionFlowService],
})
export class ActionFlowModule {
  constructor(private readonly _actionFlowService: ActionFlowService) {}
}
