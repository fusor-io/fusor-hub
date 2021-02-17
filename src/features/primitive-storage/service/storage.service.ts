import { Injectable, Logger } from '@nestjs/common';
import { AggregatesService } from 'src/shared/services/aggregates/service/aggregates.service';
import { AggregateView } from 'src/shared/services/aggregates/type';
import { ParamsService } from 'src/shared/services/params/service/params.service';
import { LoggingType } from 'src/shared/services/params/type';
import { cleanName } from 'src/shared/utils';

import {
  AggregateResults,
  FilterResultTypes,
  GetAggregateViewQueryDto,
  GetFilterQueryResult,
  GetFilterQueryResultItemFlat,
  ParamsPayloadDto,
} from '../dto';

@Injectable()
export class StorageService {
  private readonly _logger = new Logger(this.constructor.name);

  constructor(
    private readonly _paramsService: ParamsService,
    private readonly _aggregatesService: AggregatesService,
  ) {}

  public async getParam(nodeId: string, paramId: string): Promise<number> {
    try {
      return await this._paramsService.readParamValue(cleanName(nodeId), cleanName(paramId));
    } catch (error) {
      this._logger.error(`Failed reading param ${nodeId}:${paramId}`, error?.message);
      return undefined;
    }
  }

  public async saveParam(nodeId: string, paramId: string, value: number): Promise<void> {
    const node = cleanName(nodeId);
    const param = cleanName(paramId);
    try {
      await this._paramsService.writeParamValue(node, param, value);
      this._logParam(node, param, value); // don't wait
    } catch (error) {
      this._logger.error(`Failed storing ${nodeId}:${paramId}`, error?.message);
    }
  }

  async saveBatch(nodeId: string, payload: ParamsPayloadDto): Promise<void> {
    this._logger.log(`Saving batch ${nodeId}: ${JSON.stringify(payload)}`);

    if (payload && Object.keys(payload).length) {
      await Promise.all(
        Object.keys(payload).map(paramId => this.saveParam(nodeId, paramId, payload[paramId])),
      );
    }

    this._logger.log(`Batch ${nodeId} saved`);
  }

  async getBatch(query: string[]): Promise<AggregateResults> {
    const results: AggregateResults = {};

    await Promise.all(
      query.map(async item => {
        const [nodeId, paramId] = item.split('.');
        if (paramId && nodeId) {
          const value = await this.getParam(cleanName(nodeId), cleanName(paramId));
          if (value === undefined) return;

          if (!results[nodeId]) results[nodeId] = {};
          results[nodeId][paramId] = value;
        }
      }),
    );
    return results;
  }

  async filter(
    nodePattern: string,
    paramPattern: string,
    format: FilterResultTypes = FilterResultTypes.default,
  ): Promise<GetFilterQueryResult> {
    const results = await this._paramsService.filterParams(nodePattern, paramPattern);
    switch (format) {
      case FilterResultTypes.flat:
        return results.map(
          item => [item.node, item.param, item.value] as GetFilterQueryResultItemFlat,
        );
      case FilterResultTypes.odata:
        return {
          value: results.map(item => ({
            '@odata.id': `${item.node}:${item.param}`,
            '@odata.etag': `W/'${item.ts}'`,
            node: item.node,
            param: item.param,
            value: item.value,
          })),
        };
      default:
        return results;
    }
  }

  async getAggregateView(
    nodeId: string,
    paramId: string,
    query: GetAggregateViewQueryDto,
  ): Promise<AggregateView[]> {
    return this._aggregatesService.aggregateParam(
      nodeId,
      paramId,
      query.start,
      query.end,
      query.groupBy,
      query.aggregates,
    );
  }

  convertToText(values: AggregateResults | Record<string, number>): string {
    const results = [];
    Object.keys(values).forEach(nodeId => {
      const node = values[nodeId];

      if (typeof node === 'object') {
        Object.keys(node).forEach(paramId => results.push(`${nodeId}.${paramId}=${node[paramId]}`));
      } else {
        results.push(`${nodeId}=${node}`);
      }
    });
    return results.join('\n');
  }

  flatten(values: AggregateResults): Record<string, number> {
    const results: Record<string, number> = {};
    Object.keys(values).forEach(nodeId =>
      Object.keys(values[nodeId]).forEach(
        paramId => (results[`${nodeId}.${paramId}`] = values[nodeId][paramId]),
      ),
    );
    return results;
  }

  private async _logParam(nodeId: string, paramId: string, value: number): Promise<void> {
    try {
      const loggingType = await this._paramsService.getLoggingType(nodeId, paramId);
      if (loggingType === LoggingType.no) return;
      await this._paramsService.logParamValue(nodeId, paramId, value, loggingType);
    } catch (error) {
      this._logger.error(`Failed storing ${paramId}`, error?.message);
    }
  }
}
