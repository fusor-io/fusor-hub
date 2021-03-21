import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { EventEmitter, MathOperationFunction } from '../../type';
import { EventObservable, MathOperationParams } from '../../type/action-flow.type';

export class MathOperationEmitter implements EventEmitter {
  readonly emitter = combineLatest(
    // convert map to an array:
    //   { [key: string]: Observable<T> } => Observable<{ key: string, value: T }>[]
    Object.keys(this._inputs).map(key => {
      const input = this._inputs[key];
      return input.pipe(map(({ value }) => ({ key, value })));
    }),
  ).pipe(
    map(values =>
      // convert back array to a map
      //   { key: string, value: T }[] => { [key: string]: T }
      values.reduce((result, { key, value }) => {
        result[key] = value;
        return result;
      }, {} as MathOperationParams),
    ),
    map(inputs => ({
      value: this._function(inputs),
    })),
  );

  constructor(
    private _function: MathOperationFunction,
    private _inputs: Record<string, EventObservable>,
  ) {}
}
