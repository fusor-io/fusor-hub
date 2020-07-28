import { Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment';
import { AggregatesService } from 'src/shared/services/aggregates/service/aggregates.service';
import { AggregateViewValue } from 'src/shared/services/aggregates/type';
import { ParamsService } from 'src/shared/services/params/service/params.service';

import { CollectorResults, ExporterSource, ExporterType } from '../../type';

@Injectable()
export class CollectorService {
  private readonly _logger = new Logger(this.constructor.name);

  constructor(
    private readonly _paramsService: ParamsService,
    private readonly _aggregateService: AggregatesService,
  ) {}

  async collect(source: ExporterSource): Promise<CollectorResults> {
    const { param, node } = source?.selector || {};
    if (!node) throw new Error('Undefined Node');
    if (!param) throw new Error('Undefined Param');

    switch (source?.type) {
      case ExporterType.singleValue: {
        return this._paramsService.readParamValue(node, param);
      }

      case ExporterType.aggregate: {
        const { grouping, operation = AggregateViewValue.average, startOffset } =
          source.config || {};
        if (!grouping) throw new Error('Undefined Grouping');

        const timeOffset =
          moment()
            .subtract(startOffset.unit || 'd', startOffset.value || 1)
            .valueOf() / 1000;

        const result = await this._aggregateService.aggregateParam(
          node,
          param,
          timeOffset,
          Date.now(),
          grouping,
          [operation],
        );
        return result.map(item => ({ ts: item.frame, value: item[operation] }));
      }

      default:
        throw new Error(`Unknown exporter type ${source?.type}`);
    }
  }
}
