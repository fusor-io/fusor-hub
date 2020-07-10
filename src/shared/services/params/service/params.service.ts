import { Injectable } from '@nestjs/common';
import { cleanName } from 'src/shared/utils';
import { DatabaseService } from 'src/shared/services/database/service/database.service';
import { ExportType, NodeParam } from 'src/shared/services/params/type';
import { LoggingType, NodeLogging, NodeParamValue } from '../type';
import {
  LOG_TABLE_INT,
  LOG_TABLE_DOUBLE,
  PARAM_TABLE,
  PARAM_TABLE_NAME,
  VALUE_TABLE_PREFIX,
} from '../sql';

@Injectable()
export class ParamsService {
  constructor(private readonly _databaseService: DatabaseService) {}

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
    await this._databaseService.createTableIfNotExists(PARAM_TABLE, PARAM_TABLE_NAME);

    await this._databaseService.query({
      sql: `INSERT INTO ?? (\`node\`, \`param\`, \`value\`) VALUES(?,?,?) ON DUPLICATE KEY UPDATE \`value\`=?`,
      values: [PARAM_TABLE_NAME, nodeId, paramId, value, value],
    });
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
    const results = await this._databaseService.query<NodeParamValue>({
      sql: `SELECT \`value\` FROM ?? WHERE \`node\`=? AND \`param\`=? LIMIT 1`,
      values: [PARAM_TABLE_NAME, nodeId, paramId],
    });
    return results && results[0]?.value;
  }

  generateTableName(nodeId: string, sensorId: string, loggingType: LoggingType): string {
    const nodeIdCleaned = cleanName(nodeId);
    const paramIdCleaned = cleanName(sensorId);
    const dataType = loggingType === LoggingType.int ? 'i' : 'd';
    return `${VALUE_TABLE_PREFIX}:${nodeIdCleaned}:${paramIdCleaned}:${dataType}`;
  }
}
