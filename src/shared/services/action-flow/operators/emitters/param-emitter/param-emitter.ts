import { filter } from 'rxjs/operators';

import { ParamsService } from '../../../../params';
import { EmitterBase } from '../../emitter-base';
import { ParamEmitterConfig } from './config';

export const OUTPUT_PARAM = 'out';

export class ParamEmitterOperator extends EmitterBase<ParamEmitterConfig> {
  private _paramsService!: ParamsService;

  init(config: ParamEmitterConfig) {
    this._paramsService = this._moduleRef.get(ParamsService, { strict: false });   
    this.outputs[OUTPUT_PARAM] = this._paramsService.paramUpdates$.pipe(
      filter(event => event.nodeId === config.nodeId && event.paramId === config.paramId),
    );
  }
}
