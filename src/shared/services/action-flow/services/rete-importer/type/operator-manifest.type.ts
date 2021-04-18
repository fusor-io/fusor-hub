import { ModuleRef } from '@nestjs/core';

import { Operator } from '../../../operators';

export interface OperatorManifest {
  Class: { new (ref: ModuleRef): Operator };
  configGuard?: (config: any) => boolean;
}
