import { ModuleRef } from '@nestjs/core';
import { filter } from 'rxjs/operators';

import { EventObservable } from '../../../services/action-flow';
import { HandlerBase } from '../../handler-base';
import { ThrottleHandleConfig } from './config';
import { INPUT_NAMES, OUTPUT_OUT } from './const';

export class ThrottleHandlerOperator extends HandlerBase {
  readonly inputs: Record<'in', EventObservable>;
  private _config!: ThrottleHandleConfig;
  private _lastEventTime = 0;

  constructor(moduleRef: ModuleRef) {
    super(moduleRef, INPUT_NAMES);
  }

  init(config: ThrottleHandleConfig) {
    this._config = config;
  }

  engage(): boolean {
    if (!this.isFullyWired) return false;

    const duration = this._config?.duration || 0;
    this.outputs[OUTPUT_OUT] = this.inputs.in.pipe(
      filter(() => {
        const now = Date.now();
        if (now - this._lastEventTime > duration) {
          this._lastEventTime = now;
          return true;
        }
        return false;
      }),
    );

    return true;
  }
}
