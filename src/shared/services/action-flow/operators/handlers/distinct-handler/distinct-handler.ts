import { ModuleRef } from '@nestjs/core';
import { distinctUntilChanged } from 'rxjs/operators';

import { EventObservable } from '../../../services/action-flow/type/action-flow.type';
import { HandlerBase } from '../../handler-base';
import { INPUT_NAMES, OUTPUT_OUT } from './const';

export class DistinctHandlerOperator extends HandlerBase {
  readonly inputs: Record<'in', EventObservable>;

  constructor(moduleRef: ModuleRef) {
    super(moduleRef, INPUT_NAMES);
  }

  engage(): boolean {
    if (!this.isFullyWired) return false;

    this.outputs[OUTPUT_OUT] = this.inputs.in.pipe(
      distinctUntilChanged((a, b) => a.value === b.value),
    );

    return true;
  }
}
