import { ModuleRef } from '@nestjs/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { EventObservable, EventObserver, FlowEventType, KeyValueEvent } from '../services/action-flow';

export abstract class ObserverBase<C = any> implements EventObserver {
  inputs: Record<string, EventObservable> = {};

  protected readonly _subscription = new Subscription();

  constructor(protected readonly _moduleRef: ModuleRef, public readonly expectedInputs: string[]) {}

  get isFullyWired(): boolean {
    return this._missingWires() === 0;
  }

  attachInput(inputName: string, input: EventObservable): boolean {
    if (this.expectedInputs.includes(inputName)) {
      this.inputs[inputName] = input;
      return true;
    }
    return false;
  }

  abstract engage(): boolean;

  destroy(): void {
    this._subscription.unsubscribe();
  }

  init(config?: C): void {}

  /**
   * INTERNALS
   */

  protected _keyValueInputArray(): Observable<KeyValueEvent[]> {
    return combineLatest(
      // convert map to an array:
      //   { [key: string]: Observable<T> } => Observable<{ key: string, value: T }[]>
      Object.keys(this.inputs).map(key => {
        const input = this.inputs[key];
        return input.pipe(map(({ value }) => ({ key, value })));
      }),
    );
  }

  protected _valueArrayToMap(
    values: Observable<KeyValueEvent[]>,
  ): Observable<Record<string, FlowEventType>> {
    return values.pipe(
      map(values =>
        // convert back array to a map
        //   { key: string, value: T }[] => { [key: string]: T }
        values.reduce((result, { key, value }) => {
          result[key] = value;
          return result;
        }, {} as Record<string, FlowEventType>),
      ),
    );
  }

  protected _combineInputs(): Observable<Record<string, FlowEventType>> {
    return this._valueArrayToMap(this._keyValueInputArray());
  }

  protected _missingWires(): number {
    return this.expectedInputs.reduce((missingCount, key) => missingCount + +!this.inputs[key], 0);
  }
}
