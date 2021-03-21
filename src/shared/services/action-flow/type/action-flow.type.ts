import { Observable } from 'rxjs';

export type FlowEventType = number | boolean | undefined;

export type EventEmitterType = 'param' | 'operator';

export interface FlowEvent {
  value: FlowEventType;
}

export type EventObservable = Observable<FlowEvent>;

export interface EventEmitter {
  emitter: EventObservable;
}

export type MathOperationParams = Record<string, FlowEventType>;
export type MathOperationFunction = (inputs: MathOperationParams) => FlowEventType;
