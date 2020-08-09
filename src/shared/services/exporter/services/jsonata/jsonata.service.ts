import { Injectable, Logger } from '@nestjs/common';
import * as jsonata from 'jsonata';

import { ExporterContext, ExporterRef } from '../../type';

@Injectable()
export class JsonataService {
  private readonly _logger = new Logger(this.constructor.name);

  resolveRef(ref: ExporterRef, context: ExporterContext): string {
    if (typeof ref === 'string') return ref;

    try {
      const expression = jsonata(ref.query);
      const result = expression.evaluate(context);
      if (Array.isArray(result))
        throw 'JSONata should evaluate to single value. Array was received.';
        
      return (result ?? '').toString();
    } catch (error) {
      this._logger.error(
        `Failed evaluating JSONata expression: ${JSON.stringify({ ref, context })} `,
      );
      return '';
    }
  }
}
