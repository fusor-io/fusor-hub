import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { format } from 'date-fns';
import pupa from 'pupa';
import { Subscription } from 'rxjs';

import { MessagingService } from '../../../../messaging';
import { FlowEvent } from '../../../services/action-flow';
import { ObserverBase } from '../../observer-base';
import { SmsSenderConfig } from './config';
import { INPUT_IN } from './const';

export class SmsSenderOperator extends ObserverBase {
  private readonly _logger = new Logger(this.constructor.name);
  private _config!: SmsSenderConfig;
  private _messagingService: MessagingService;

  constructor(moduleRef: ModuleRef) {
    super(moduleRef, [INPUT_IN]);
    this._messagingService = moduleRef.get(MessagingService);
  }

  init(config: SmsSenderConfig) {
    this._config = config;
  }

  engage(): boolean {
    if (!this.isFullyWired) return false;

    this._subscription.add(this._eventSubscription());

    return true;
  }

  private _eventSubscription(): Subscription {
    return this.inputs[INPUT_IN].subscribe(event => this._sendSms(event));
  }

  private _sendSms(event: FlowEvent): void {
    const { text, recipient } = this._config || {};
    if (recipient) {
      const now = format(Date.now(), 'eee p');
      const message = text ? pupa(text, { in: event.value, now }) : String(event.value);
      this._messagingService.send(recipient, message);
    }
  }
}
