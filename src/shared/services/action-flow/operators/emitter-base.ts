import { ModuleRef } from '@nestjs/core';

import { EventObservable } from '../services/action-flow';
import { EventEmitter } from '../services/action-flow/type';

export abstract class EmitterBase<C = any> implements EventEmitter {
  outputs: Record<string, EventObservable> = {};

  constructor(protected readonly _moduleRef: ModuleRef) {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  init(config?: C): void {}
}
