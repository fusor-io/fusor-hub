import { Injectable, Logger, LogLevel } from '@nestjs/common';

import { CronService } from '../../cron';
import { ParamsService } from '../../params';
import { HUB_NODE, LOG_LEVEL_MAP, LOG_LEVEL_PARAM } from '../const';
import { ActiveLogLevel } from '../type';

@Injectable()
export class LogLevelManagerService {
  private _activeLogLevel = ActiveLogLevel.log;
  private readonly _logger = new Logger(this.constructor.name);

  constructor(
    private readonly _paramsService: ParamsService,
    private readonly _cronService: CronService,
  ) {}

  scheduleLevelUpdate(): void {
    this._logger.log('Scheduling log level checker');
    this._cronService.schedule(this, 'log-manager', '*/5 * * * * *', () => this.readLogLevel());
  }

  async readLogLevel(): Promise<void> {
    let logLevel = ActiveLogLevel.log;
    try {
      logLevel = await this._paramsService.readParamValue(HUB_NODE, LOG_LEVEL_PARAM, false);

      if (logLevel === undefined) {
        logLevel = ActiveLogLevel.log;
      }
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
