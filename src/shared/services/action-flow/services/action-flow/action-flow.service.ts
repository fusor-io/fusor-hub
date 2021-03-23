import { Injectable, Logger } from '@nestjs/common';
import { ParamsService } from 'src/shared/services/params/service/params.service';

@Injectable()
export class ActionFlowService {
  private readonly _logger = new Logger(this.constructor.name);

  public readonly params = this._paramsService.paramUpdates$;

  constructor(private readonly _paramsService: ParamsService) {
    this.params.subscribe(param => this._logger.log('PARAM ' + JSON.stringify(param)));
  }
}
