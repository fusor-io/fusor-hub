import { Injectable, Logger } from '@nestjs/common';
import { cleanName } from 'src/shared/utils';
import { DatabaseService } from 'src/shared/services/database/service/database.service';
import { ExportType, NodeParam, WriteCache, ParamEntry } from 'src/shared/services/params/type';
import { LoggingType, NodeLogging, NodeParamValue } from '../type';
import {
  LOG_TABLE_INT,
  LOG_TABLE_DOUBLE,
  PARAM_TABLE,
  PARAM_TABLE_NAME,
  VALUE_TABLE_PREFIX,
} from '../sql';
import { WRITE_DELAY } from '../const';

@Injectable()
export class ParamsService {
  private readonly _logger = new Logger(this.constructor.name);

  constructor(private readonly _databaseService: DatabaseService) {}

  private readonly _writeCache: WriteCache = {};

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

  async delayedWriteParamValue(nodeId: string, paramId: string, value: number): Promise<void> {
    /*
     * Motivation: default target platform for this server is Raspberry Pi.
     * It stores data in SD card. These cards has limited re-write cycle number (eg. 10K times)
     * So we want to reduce number of times re-writing data to the same location.
     */
    const key = this._getCacheKey(nodeId, paramId);
    if (this._writeCache[key]) {
      const currentEntry = this._writeCache[key];

      const now = Date.now();
      if (now - currentEntry.lastWriteTime > WRITE_DELAY) {
        await this.writeParamValue(nodeId, paramId, value);
        currentEntry.lastWriteTime = now;
        currentEntry.isFlushed = true;
      } else {
        currentEntry.isFlushed = false;
        this._logger.log(`Delaying param update ${nodeId}:${paramId}=${value}`);
      }

      currentEntry.value = value;
    } else {
      // write first time, to be sure we have entry for configuration
      await this.writeParamValue(nodeId, paramId, value);
      this._writeCache[key] = {
        nodeId,
        paramId,
        value,
        lastWriteTime: Date.now(),
        isFlushed: true,
      };
    }
  }

  async writeParamValue(nodeId: string, paramId: string, value: number): Promise<void> {
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
        await this.writeParamValue(item.nodeId, item.paramId, item.value);
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

  async readParamValue(nodeId: string, paramId: string): Promise<number> {
    const cachedItem = this._writeCache[this._getCacheKey(nodeId, paramId)];
    if (cachedItem) {
      return cachedItem.value;
    }

    const results = await this._databaseService.query<NodeParamValue>({
      sql: `SELECT \`value\` FROM ?? WHERE \`node\`=? AND \`param\`=? LIMIT 1`,
      values: [PARAM_TABLE_NAME, nodeId, paramId],
    });
    return results && results[0]?.value;
  }

  async filterParams(nodePattern: string, paramPattern: string): Promise<ParamEntry[]> {
    await this.flushWriteCache();

    const results = await this._databaseService.query<ParamEntry>({
      sql: `SELECT \`node\`, \`param\`, \`value\` FROM ?? WHERE \`node\` like ? AND \`param\` like ?`,
      values: [PARAM_TABLE_NAME, nodePattern || '%', paramPattern || '%'],
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
}
