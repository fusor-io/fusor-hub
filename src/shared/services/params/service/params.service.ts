import { Injectable, Logger } from '@nestjs/common';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { inspect } from 'util';

import { sleep } from '../../../../shared/utils/sleep';
import { cleanName } from '../../../utils';
import { DatabaseService } from '../../database/service/database.service';
import { ExportType, NodeParam, ParamEntry, ParamUpdateEvent, WriteCache } from '../../params/type';
import { WRITE_DELAY } from '../const';
import {
  LOG_TABLE_DOUBLE,
  LOG_TABLE_INT,
  PARAM_TABLE,
  PARAM_TABLE_NAME,
  VALUE_TABLE_PREFIX,
} from '../sql';
import { LoggingType, NodeLogging, NodeParamValue, ParamWriteHookFn } from '../type';

@Injectable()
export class ParamsService {
  private readonly _logger = new Logger(this.constructor.name);
  private _paramUpdates$ = new BehaviorSubject<ParamUpdateEvent | undefined>(undefined);

  public paramUpdates$ = this._paramUpdates$.pipe(filter(data => data !== undefined));

  constructor(private readonly _databaseService: DatabaseService) {}

  private readonly _writeCache: WriteCache = {};
  private readonly _writeHooks: ParamWriteHookFn[] = [];

  registerWriteHook(hook: ParamWriteHookFn): void {
    this._writeHooks.push(hook);
  }

  async logParamValue(
    nodeId: string,
    paramId: string,
    value: number,
    loggingType: LoggingType,
  ): Promise<void> {
    const tableName = this.generateTableName(nodeId, paramId, loggingType);
    const tableTemplate = loggingType === LoggingType.int ? LOG_TABLE_INT : LOG_TABLE_DOUBLE;
    await this._databaseService.createTableIfNotExists(tableTemplate, tableName);

    await this._databaseService.query({
      sql: `INSERT INTO \`${tableName}\` (\`value\`) VALUES(?);`,
      values: [value],
    });
  }

  async writeParamValue(nodeId: string, paramId: string, value: number): Promise<void> {
    /*
     * Motivation for delayed write:
     * Default target platform for this server is Raspberry Pi.
     * It stores data in SD card. These cards has limited re-write cycle number (eg. 10K times)
     * So we want to reduce number of times re-writing data to the same location.
     */

    const key = this._getCacheKey(nodeId, paramId);
    if (this._writeCache[key]) {
      const currentEntry = this._writeCache[key];

      const now = Date.now();
      if (now - currentEntry.lastWriteTime > WRITE_DELAY) {
        await this._writeParamValue(nodeId, paramId, value);
        currentEntry.lastWriteTime = now;
        currentEntry.isFlushed = true;
      } else {
        currentEntry.isFlushed = false;
        this._logger.log(`Delaying param update ${nodeId}:${paramId}=${value}`);
      }

      currentEntry.value = value;
    } else {
      // write first time, to be sure we have entry for configuration
      await this._writeParamValue(nodeId, paramId, value);
      this._writeCache[key] = {
        nodeId,
        paramId,
        value,
        lastWriteTime: Date.now(),
        isFlushed: true,
      };
    }

    this._callWriteHooks(nodeId, paramId, value);
  }

  async emitCurrentValues(): Promise<void> {
    this._logger.log('Emitting all params');

    try {
      const allParams = await this.filterParams();
      for (const { node: nodeId, param: paramId, value } of allParams) {
        this._paramUpdates$.next({ nodeId, paramId, value });
      }
      this._logger.log(`${allParams.length} params emitted`);
    } catch (error) {
      this._logger.error(`Emitting failed: ${inspect(error)}`);
    }
  }

  private async _writeParamValue(nodeId: string, paramId: string, value: number): Promise<void> {
    try {
      await this._databaseService.createTableIfNotExists(PARAM_TABLE, PARAM_TABLE_NAME);

      await this._databaseService.query({
        sql: `INSERT INTO ?? (\`node\`, \`param\`, \`value\`) VALUES(?,?,?) ON DUPLICATE KEY UPDATE \`value\`=?`,
        values: [PARAM_TABLE_NAME, nodeId, paramId, value, value],
      });

      this._logger.log(`Updated param ${nodeId}:${paramId}=${value}`);
    } catch (error) {
      this._logger.error(`Failed updating param ${nodeId}:${paramId}=${value}`);
    }
  }

  async flushWriteCache(): Promise<void> {
    this._logger.log('Flushing write cache...');
    for (const key of Object.keys(this._writeCache)) {
      const item = this._writeCache[key];
      if (!item.isFlushed) {
        await this._writeParamValue(item.nodeId, item.paramId, item.value);
        item.isFlushed = true;
        item.lastWriteTime = Date.now();
        await sleep(20); // reduce load to db
      }
    }
    this._logger.log('...write cache flushed');
  }

  async getLoggingType(nodeId: string, paramId: string): Promise<LoggingType> {
    const results = await this._databaseService.query<NodeLogging>({
      sql: `SELECT \`logging\` FROM ?? WHERE \`node\`=? AND \`param\`=? LIMIT 1`,
      values: [PARAM_TABLE_NAME, nodeId, paramId],
    });
    return (results && results[0].logging) || LoggingType.no;
  }

  async getExports(exportType: ExportType): Promise<NodeParam[]> {
    const results = await this._databaseService.query<NodeParam>({
      sql: `SELECT \`node\`,\`param\` FROM ?? WHERE \`export\`=?`,
      values: [PARAM_TABLE_NAME, exportType],
    });
    return results || [];
  }

  async readParamValue(nodeId: string, paramId: string, useCache = true): Promise<number> {
    const cacheKey = this._getCacheKey(nodeId, paramId);
    const cachedItem = this._writeCache[cacheKey];

    if (useCache) {
      if (cachedItem) {
        return cachedItem.value;
      }
    }

    // this path is used when we do not want cache, or value is not in cache

    const results = await this._databaseService.query<NodeParamValue>({
      sql: `SELECT \`value\`, UNIX_TIMESTAMP(\`ts\`) as \`ts\` FROM ?? WHERE \`node\`=? AND \`param\`=? LIMIT 1`,
      values: [PARAM_TABLE_NAME, nodeId, paramId],
    });

    let result = results && results[0];

    if (cachedItem && (result?.ts || 0) * 1000 <= cachedItem.lastWriteTime) {
      // results are older than cache - use cached value
      result = { param: paramId, value: cachedItem.value, ts: cachedItem.lastWriteTime };
    } else {
      // update cache - it is obsolete or non present
      if (result?.value !== undefined) {
        this._writeCache[cacheKey] = {
          nodeId,
          paramId,
          value: result.value,
          lastWriteTime: Math.round(result.ts * 1000),
          isFlushed: true,
        };
      }
    }

    return result?.value;
  }

  async filterParams(nodePattern?: string, paramPattern?: string): Promise<ParamEntry[]> {
    await this.flushWriteCache();

    const results = await this._databaseService.query<ParamEntry>({
      sql: `SELECT \`node\`, \`param\`, \`value\`, UNIX_TIMESTAMP(\`ts\`) as \`ts\` FROM ?? WHERE \`node\` like ? AND \`param\` like ?`,
      values: [PARAM_TABLE_NAME, nodePattern || '%', paramPattern || '%'],
    });

    return results || [];
  }

  async regexpParams(nodeMatch: string, paramMatch: string): Promise<ParamEntry[]> {
    await this.flushWriteCache();

    const results = await this._databaseService.query<ParamEntry>({
      sql: `SELECT \`node\`, \`param\`, \`value\`, UNIX_TIMESTAMP(\`ts\`) as \`ts\` FROM ?? WHERE \`node\` regexp ? AND \`param\` regexp ?`,
      values: [PARAM_TABLE_NAME, nodeMatch || '*.', paramMatch || '*.'],
    });

    return results || [];
  }

  generateTableName(nodeId: string, sensorId: string, loggingType: LoggingType): string {
    const nodeIdCleaned = cleanName(nodeId);
    const paramIdCleaned = cleanName(sensorId);
    const dataType = loggingType === LoggingType.int ? 'i' : 'd';
    return `${VALUE_TABLE_PREFIX}:${nodeIdCleaned}:${paramIdCleaned}:${dataType}`;
  }

  private _getCacheKey(nodeId: string, paramId: string): string {
    return `${paramId}@${nodeId}`;
  }

  private async _callWriteHooks(nodeId: string, paramId: string, value: number): Promise<void> {
    this._paramUpdates$.next({ nodeId, paramId, value });

    for (const hook of this._writeHooks) {
      try {
        await hook(nodeId, paramId, value);
      } catch (error) {
        this._logger.error(`Failed calling write hook (${nodeId}:${paramId}=${value})`, error);
      }
    }
  }
}
