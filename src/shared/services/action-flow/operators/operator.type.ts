import { EmitterBase } from './emitter-base';
import { HandlerBase } from './handler-base';
import { ObserverBase } from './observer-base';

export type Operator = ObserverBase | EmitterBase | HandlerBase;
