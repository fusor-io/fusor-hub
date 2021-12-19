import { Injectable, Logger } from '@nestjs/common';
import moment from 'moment';

import { AggregatesService, AggregateViewValue } from '../../../aggregates';
import { ParamsService } from '../../../params';
import { CollectorResults, ExporterSource, ExporterType } from '../../type';
import { MAX_AGGREGATE_VALUE_COUNT } from './../../../../const/aggregate-view-grouping-map.const';

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
        const {
          grouping,
          operation = AggregateViewValue.average,
          startOffset,
          limit = MAX_AGGREGATE_VALUE_COUNT,
        } = source.config || {};
        if (!grouping) throw new Error('Undefined Grouping');

        const timeOffset =
          moment()
            .subtract(startOffset.value || 1, startOffset.unit || 'd')
            .valueOf() / 1000;

        const result = await this._aggregateService.aggregateParam(
          node,
          param,
          timeOffset,
          Date.now(),
          grouping,
          [operation],
          limit,
        );
        return result.map(item => ({ ts: item.frame, value: item[operation] }));
      }

      default:
        throw new Error(`Unknown exporter type ${source?.type}`);
    }
  }
}
