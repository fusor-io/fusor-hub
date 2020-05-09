import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/shared/services/database/service/database.service';
import { LoggingType } from 'src/shared/services/database/type';
import { ParamsPayloadDto } from '../dto/post-batch-payload.dto';
import { AggregateResults } from '../dto/get-aggregate-result.dto';
import { sanitizeName } from 'src/shared/utils/sanitizer';

@Injectable()
export class StorageService {
  private readonly _logger = new Logger(this.constructor.name);

  constructor(private readonly _databaseService: DatabaseService) {}

  public async getParam(nodeId: string, paramId: string): Promise<number> {
    try {
      return await this._databaseService.readParamValue(
        sanitizeName(nodeId),
        sanitizeName(paramId),
      );
    } catch (error) {
      this._logger.error(`Failed reading param ${nodeId}:${paramId}`, error?.message);
      return undefined;
    }
  }

  public async saveParam(nodeId: string, paramId: string, value: number): Promise<void> {
    const node = sanitizeName(nodeId);
    const param = sanitizeName(paramId);
    try {
      await this._databaseService.writeParamValue(node, param, value);
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

  flatten(values: AggregateResults): string {
    const results = [];
    Object.keys(values).forEach(nodeId =>
      Object.keys(values[nodeId]).forEach(paramId =>
        results.push(`${nodeId}.${paramId}=${values[nodeId][paramId]}`),
      ),
    );
    return results.join('\n');
  }

  private async _logParam(nodeId: string, paramId: string, value: number): Promise<void> {
    try {
      const loggingType = await this._databaseService.getLoggingType(nodeId, paramId);
      if (loggingType === LoggingType.no) return;
      await this._databaseService.logParamValue(nodeId, paramId, value, loggingType);
    } catch (error) {
      this._logger.error(`Failed storing ${paramId}`, error?.message);
    }
  }
}
