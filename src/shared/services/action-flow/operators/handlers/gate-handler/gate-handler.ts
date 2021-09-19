import { ModuleRef } from '@nestjs/core';
import { combineLatest } from 'rxjs';
import { filter, map, startWith, take, withLatestFrom } from 'rxjs/operators';

import { EventObservable } from '../../../services/action-flow';
import { HandlerBase } from '../../handler-base';
import { INPUT_NAMES, OUTPUT_OUT } from './const';

export class GateHandlerOperator extends HandlerBase {
  readonly inputs: Record<'in' | 'gate', EventObservable>;

  constructor(moduleRef: ModuleRef) {
    super(moduleRef, INPUT_NAMES);
  }

  engage(): boolean {
    if (!this.isFullyWired) return false;

    this.outputs[OUTPUT_OUT] = combineLatest([
      this.inputs.in,
      this.inputs.gate.pipe(take(1)), // wait until gate receives first value
    ]).pipe(
      map(([value]) => value),
      withLatestFrom(this.inputs.gate.pipe(startWith({ value: true }))),
      filter(([, gate]) => !!gate.value),
      map(([{ value }]) => ({ value })),
    );

    return true;
  }
}
