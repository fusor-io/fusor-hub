import { EventHandler, EventObservable } from '../services/action-flow';
import { ObserverBase } from './observer-base';

export abstract class HandlerBase<C = any> extends ObserverBase<C> implements EventHandler {
  outputs: Record<string, EventObservable> = {};
}
