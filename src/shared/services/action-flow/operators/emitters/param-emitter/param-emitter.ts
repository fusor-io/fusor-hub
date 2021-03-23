import { Inject } from '@nestjs/common';
import { filter } from 'rxjs/operators';

import { ActionFlowService } from '../../../services/action-flow/action-flow.service';
import { EventEmitter, EventObservable } from '../../../services/action-flow/type';

export class ParamEmitterOperator implements EventEmitter {
  @Inject() private readonly _actionFlowService: ActionFlowService;

  outputs: Record<string, EventObservable> = {};

  constructor(nodeId: string, paramId: string) {
    this.outputs['param'] = this._actionFlowService.params.pipe(
      filter(event => event.nodeId === nodeId && event.paramId === paramId),
    );
  }
}
