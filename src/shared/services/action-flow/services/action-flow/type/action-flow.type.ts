import { Observable } from 'rxjs';

export type FlowEventType = number | boolean | undefined;

export type EventEmitterType = 'param' | 'operator';

export interface FlowEvent {
  value: FlowEventType;
}

export type EventObservable = Observable<FlowEvent | undefined>;

export interface EventEmitter {
  outputs: Record<string, EventObservable>;
}

export interface EventObserver {
  inputs: Record<string, EventObservable>;
  destroy: () => void;
}

export interface EventHandler extends EventEmitter, EventObserver {}

export type MathOperationParams = Record<string, FlowEventType>;
export type MathOperationFunction = (inputs: MathOperationParams) => FlowEventType;
