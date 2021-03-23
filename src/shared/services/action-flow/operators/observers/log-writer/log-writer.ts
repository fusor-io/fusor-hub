import { Inject, Logger } from '@nestjs/common';
import { from, Subscription } from 'rxjs';

import { EventObservable, EventObserver } from '../../../services/action-flow/type';
import { FlowEvent } from './../../../services/action-flow/type/action-flow.type';

const INPUT_NAMES = ['in'];

export class LogWriter implements EventObserver {
  @Inject() private readonly _logger = new Logger(this.constructor.name);

  readonly inputs: Record<string, EventObservable> = {};

  private readonly _subscription = new Subscription();

  constructor(inputs: Record<string, EventObservable>) {
    const input = inputs[INPUT_NAMES[0]]
      ? inputs[INPUT_NAMES[0]]
      : from([] as Array<FlowEvent | undefined>);
    this.inputs[INPUT_NAMES[0]] = input;
    this._subscription.add(
      input.subscribe(event => this._logger.log(`Event: ${JSON.stringify(event)}`)),
    );
  }

  destroy(): void {
    this._subscription.unsubscribe();
  }
}
