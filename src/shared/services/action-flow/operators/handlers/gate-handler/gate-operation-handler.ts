import { ModuleRef } from '@nestjs/core';
import { combineLatest } from 'rxjs';
import { delay, filter, map } from 'rxjs/operators';

import { EventObservable } from '../../../services/action-flow/type/action-flow.type';
import { HandlerBase } from '../../handler-base';
import { INPUT_NAMES, OUTPUT_OUT } from './const';

export class GateOperationHandler extends HandlerBase {
  readonly inputs: Record<'value' | 'gate', EventObservable>;

  constructor(moduleRef: ModuleRef) {
    super(moduleRef, INPUT_NAMES);
  }

  engage(): boolean {
    if (!this.isFullyWired) return false;

    this.outputs[OUTPUT_OUT] = combineLatest([
      this.inputs.gate,
      // Postpone for the next JS cycle
      // to be sure that gate value comes first
      this.inputs.value.pipe(delay(0)),
    ]).pipe(
      filter(([gate]) => !!gate.value),
      map(([, { value }]) => ({ value })),
    );

    return true;
  }
}
