import { Injectable } from '@nestjs/common';
import { escape } from 'mysql';
import { AGGREGATE_VIEW_GROUPING_MAP } from 'src/shared/const';

import { DatabaseService } from '../../database/service/database.service';
import { ParamsService } from '../../params/service/params.service';
import { AGGREGATE_VALUE_MAP, MINUTE_PRECISION_GROUPINGS, MONTH_PRECISION_GROUPINGS } from '../const';
import { AggregateView, AggregateViewGrouping, AggregateViewValue } from '../type';

@Injectable()
export class AggregatesService {
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

    return this._databaseService.query<AggregateView>({
      sql: `SELECT ${frameQuery} AS frame, ${aggregatesQuery} FROM \`${tableName}\`
           WHERE UNIX_TIMESTAMP(ts) >= ? ${endQuery}
           GROUP BY frame LIMIT 100`,
      values: [start],
    });
  }
}
