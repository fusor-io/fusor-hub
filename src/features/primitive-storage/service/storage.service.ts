import { Injectable, Logger } from '@nestjs/common';

import { sanitizeName } from 'src/shared/utils/sanitizer';
import { ParamsService } from 'src/shared/services/params/service/params.service';
import { LoggingType } from 'src/shared/services/params/type';
import { AggregatesService } from 'src/shared/services/aggregates/service/aggregates.service';
import { AggregateView } from 'src/shared/services/aggregates/type';

import { GetAggregateViewQueryDto, AggregateResults, ParamsPayloadDto } from '../dto';

@Injectable()
export class StorageService {
  private readonly _logger = new Logger(this.constructor.name);

  constructor(
    private readonly _paramsService: ParamsService,
    private readonly _aggregatesService: AggregatesService,
  ) {}

  public async getParam(nodeId: string, paramId: string): Promise<number> {
    try {
      return await this._paramsService.readParamValue(sanitizeName(nodeId), sanitizeName(paramId));
    } catch (error) {
      this._logger.error(`Failed reading param ${nodeId}:${paramId}`, error?.message);
      return undefined;
    }
  }

  public async saveParam(nodeId: string, paramId: string, value: number): Promise<void> {
    const node = sanitizeName(nodeId);
    const param = sanitizeName(paramId);
    try {
      await this._paramsService.writeParamValue(node, param, value);
      this._logParam(node, param, value); // don't wait
    } catch (error) {
      this._logger.error(`Failed storing ${nodeId}:${paramId}`, error?.message);
    }
  }

  async saveBatch(nodeId: string, payload: ParamsPayloadDto): Promise<void> {
    if (payload && Object.keys(payload).length) {
      await Promise.all(
        Object.keys(payload).map(paramId =>
          this.saveParam(sanitizeName(nodeId), sanitizeName(paramId), payload[paramId]),
        ),
      );
    }
  }

  async getBatch(query: string[]): Promise<AggregateResults> {
    const results: AggregateResults = {};

    await Promise.all(
      query.map(async item => {
        const [nodeId, paramId] = item.split('.');
        if (paramId && nodeId) {
          const value = await this.getParam(sanitizeName(nodeId), sanitizeName(paramId));
          if (value === undefined) return;

          if (!results[nodeId]) results[nodeId] = {};
          results[nodeId][paramId] = value;
        }
      }),
    );
    return results;
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

  flattenObject(values: AggregateResults): string {
    const results = [];
    Object.keys(values).forEach(nodeId =>
      Object.keys(values[nodeId]).forEach(paramId =>
        results.push(`${nodeId}.${paramId}=${values[nodeId][paramId]}`),
      ),
    );
    return results.join('\n');
  }

  async dump(): Promise<void> {
    for (let i = 0; i < 100000; i++) {
      await this._logParam('test', 'test', Math.random() * 1000);
      // await new Promise(resolve => setTimeout(resolve, 5));
    }
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
