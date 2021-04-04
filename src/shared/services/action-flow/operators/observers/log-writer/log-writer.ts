import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Subscription } from 'rxjs';

import { FlowEvent } from '../../../services/action-flow';
import { ObserverBase } from '../../observer-base';

export const INPUT_IN = 'in';

export class LogWriterOperator extends ObserverBase {
  private readonly _logger = new Logger(this.constructor.name);

  constructor(moduleRef: ModuleRef) {
    super(moduleRef, [INPUT_IN]);
  }

  engage(): boolean {
    if (!this.isFullyWired) return false;
    this._subscription.add(this._eventSubscription());
    return true;
  }

  private _eventSubscription(): Subscription {
    return this.inputs[INPUT_IN].subscribe(event => this._logEvent(event));
  }

  private _logEvent(event: FlowEvent): void {
    this._logger.log(`Event: ${JSON.stringify(event)}`);
  }
}
