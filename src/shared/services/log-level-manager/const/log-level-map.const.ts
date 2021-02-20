import { LogLevel } from '@nestjs/common';

import { ActiveLogLevel } from '../type';

export const LOG_LEVEL_MAP = {
  [ActiveLogLevel.error]: <LogLevel[]>['error'],
  [ActiveLogLevel.warn]: <LogLevel[]>['error', 'warn'],
  [ActiveLogLevel.log]: <LogLevel[]>['log', 'error', 'warn', 'debug', 'verbose'],
};
