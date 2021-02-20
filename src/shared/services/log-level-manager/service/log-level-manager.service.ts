import { Injectable, Logger, LogLevel } from '@nestjs/common';
import { scheduleJob } from 'node-schedule';

import { ParamsService } from '../../params/service/params.service';
import { HUB_NODE, LOG_LEVEL_MAP, LOG_LEVEL_PARAM } from '../const';
import { ActiveLogLevel } from '../type';

@Injectable()
export class LogLevelManagerService {
  private _activeLogLevel = ActiveLogLevel.log;
  private readonly _logger = new Logger(this.constructor.name);

  constructor(private readonly _paramsService: ParamsService) {}

  scheduleLevelUpdate(): void {
    this._logger.log('Scheduling log level checker');
    scheduleJob('Check Log Level', '*/5 * * * * *', () => this.readLogLevel());
  }

  async readLogLevel(): Promise<void> {
    let logLevel = ActiveLogLevel.log;
    try {
      logLevel =
        (await this._paramsService.readParamValue(HUB_NODE, LOG_LEVEL_PARAM)) | ActiveLogLevel.log;
    } catch (error) {
      this._logger.error('Failed reading log level param', error?.message);
      return;
    }

    if (this._activeLogLevel != logLevel) {
      // switch to full logging to log this message
      Logger.overrideLogger(LOG_LEVEL_MAP[ActiveLogLevel.log]);
      this._logger.log(`Changing log level to ${logLevel}`);

      // switch to required log level
      Logger.overrideLogger(this.getLevelValue(logLevel));
      this._activeLogLevel = logLevel;
    }
  }

  getLevelValue(level: ActiveLogLevel): LogLevel[] {
    return LOG_LEVEL_MAP[level] || LOG_LEVEL_MAP[ActiveLogLevel.log];
  }
}
