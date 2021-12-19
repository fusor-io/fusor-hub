import { Injectable, Logger } from '@nestjs/common';
import { escape } from 'mysql';

import { AGGREGATE_VIEW_GROUPING_MAP, MAX_AGGREGATE_VALUE_COUNT } from '../../../const';
import { DatabaseService } from '../../database';
import { ParamsService } from '../../params';
import { AGGREGATE_VALUE_MAP, MINUTE_PRECISION_GROUPINGS, MONTH_PRECISION_GROUPINGS } from '../const';
import { AggregateView, AggregateViewGrouping, AggregateViewValue } from '../type';

@Injectable()
export class AggregatesService {
  private readonly _logger = new Logger(this.constructor.name);

  constructor(
    private readonly _databaseService: DatabaseService,
    private readonly _paramsService: ParamsService,
  ) {}

  async aggregateParam(
    nodeId: string,
    paramId: string,
    start: number,
    end: number,
    groupBy: AggregateViewGrouping,
    aggregates: AggregateViewValue[],
    limit = 100,
  ): Promise<AggregateView[]> {
    const loggingType = await this._paramsService.getLoggingType(nodeId, paramId);
    const tableName = this._paramsService.generateTableName(nodeId, paramId, loggingType);
    const endQuery = end ? ` AND UNIX_TIMESTAMP(ts) < ${escape(end)}` : '';
    let frameQuery: string;
    const aggregatesQuery =
      (aggregates || [])
        .map(aggregate => AGGREGATE_VALUE_MAP[aggregate])
        .filter(aggregate => aggregate)
        .join(', ') || AGGREGATE_VALUE_MAP[AggregateViewValue.average];

    if (MINUTE_PRECISION_GROUPINGS.includes(groupBy)) {
      const divider = AGGREGATE_VIEW_GROUPING_MAP[groupBy];
      frameQuery = `FLOOR(UNIX_TIMESTAMP(ts)/${divider})*${divider}`;
    } else if (MONTH_PRECISION_GROUPINGS.includes(groupBy)) {
      switch (AGGREGATE_VIEW_GROUPING_MAP[groupBy]) {
        case 1:
          frameQuery = 'YEAR(ts)*12 + MONTH(ts)';
          break;

        case 3:
          frameQuery = 'YEAR(ts)*4 + QUARTER(ts)';
          break;

        case 6:
          frameQuery = 'YEAR(ts)*2 + FLOOR(QUARTER(ts)/2)';
          break;
      }
    } else {
      frameQuery = 'YEAR(ts)';
    }

    if (limit > MAX_AGGREGATE_VALUE_COUNT) {
      this._logger.warn(
        `Query limit ${limit} is too large, reducing to ${MAX_AGGREGATE_VALUE_COUNT}`,
      );
      limit = MAX_AGGREGATE_VALUE_COUNT;
    } else if (limit < 1) {
      this._logger.warn(`Query limit ${limit} is < 1, changing to 1`);
      limit = 1;
    }

    return this._databaseService.query<AggregateView>({
      sql: `SELECT ${frameQuery} AS frame, ${aggregatesQuery} FROM \`${tableName}\`
           WHERE UNIX_TIMESTAMP(ts) >= ? ${endQuery}
           GROUP BY frame LIMIT ${limit}`,
      values: [start],
    });
  }
}
