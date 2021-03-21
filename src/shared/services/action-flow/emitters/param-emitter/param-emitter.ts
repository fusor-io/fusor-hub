import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ParamUpdateEvent } from 'src/shared/services/params/type';

import { EventEmitter } from '../../type';

export class ParamEmitter implements EventEmitter {
  readonly emitter = this._source$.pipe(
    filter(data => data.nodeId === this.node && data.paramId === this.param),
  );

  constructor(
    private _source$: Observable<ParamUpdateEvent>,
    public readonly node: string,
    public readonly param: string,
  ) {}
}
