import { Observable } from 'rxjs';

export type FlowEventType = number | boolean | undefined;

export interface FlowEvent {
  value: FlowEventType;
}

export interface KeyValueEvent {
  key: string;
  value: FlowEventType;
}

export type EventObservable = Observable<FlowEvent | undefined>;

export interface EventEmitter {
  outputs: Record<string, EventObservable>;
  init: () => void;
}

export interface EventObserver {
  expectedInputs: string[];
  inputs: Record<string, EventObservable>;
  init: () => void;
  destroy: () => void;
  engage: () => boolean;
}

export interface EventHandler extends EventEmitter, EventObserver {}

export type EventOperator = EventEmitter | EventObserver | EventHandler;

export function isEventObserver(value: EventOperator): value is EventObserver {
  return 'inputs' in value && 'expectedInputs' in value;
}

export function isEventEmitter(value: EventOperator): value is EventEmitter {
  return 'outputs' in value;
}
