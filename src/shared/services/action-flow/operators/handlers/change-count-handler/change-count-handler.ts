import { ModuleRef } from '@nestjs/core';
import { filter, map, pairwise, startWith } from 'rxjs/operators';

import { EventObservable, FlowEvent } from '../../../services/action-flow';
import { HandlerBase } from '../../handler-base';
import { INPUT_NAMES, OUTPUT_OUT } from './const';

export class ChangeCountHandlerOperator extends HandlerBase {
  readonly inputs: Record<'in', EventObservable>;
  private _count = 0;

  constructor(moduleRef: ModuleRef) {
    super(moduleRef, INPUT_NAMES);
  }

  engage(): boolean {
    if (!this.isFullyWired) return false;

    this.outputs[OUTPUT_OUT] = this.inputs.in.pipe(
      startWith({ value: NaN }),
      pairwise<FlowEvent>(),
      filter(([a, b]) => a.value !== b.value),
      map(() => ({ value: ++this._count })),
    );

    return true;
  }
}
