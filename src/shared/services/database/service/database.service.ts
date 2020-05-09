import { createPool, createConnection, Pool, PoolConnection, QueryOptions } from 'mysql';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Config } from 'src/shared/type';
import { DEFAULT_MYSQL } from 'src/shared/const';
import {
  LOG_TABLE_DOUBLE,
  PARAM_TABLE,
  VALUE_TABLE_PREFIX,
  PARAM_TABLE_NAME,
  LOG_TABLE_INT,
} from '../sql';
import { NodeParam, LoggingType, NodeLogging } from '../type';
import { NodeParamsDto } from '../dto';
import { sanitizeName } from 'src/shared/utils/sanitizer';

@Injectable()
export class DatabaseService {
  private readonly _logger = new Logger(this.constructor.name);
  private readonly _tableCache = {};
  private _pool: Pool;

  constructor(private readonly _configService: ConfigService) {}

  async init() {
    if (!this._pool) {
      await this._createDbIfNotExists();

      this._pool = createPool({
        connectionLimit:
          this._configService.get<number>(Config.mySqlPoolSize) || DEFAULT_MYSQL.poolSize,
        host: this._configService.get<string>(Config.mySqlUrl) || DEFAULT_MYSQL.host,
        port: this._configService.get<number>(Config.mySqlPort) || DEFAULT_MYSQL.port,
        user: this._configService.get<string>(Config.mySqlUser),
        password: this._configService.get<string>(Config.mySqlPassword),
        database: this._configService.get<string>(Config.mySqlDb),
      });
    }
  }

  async getConnection(): Promise<PoolConnection> {
    await this.init();
    return new Promise((resolve, reject) =>
      this._pool.getConnection((error, connection) =>
        error ? reject(error) : resolve(connection),
      ),
    );
  }

  async query<T>(query: QueryOptions): Promise<T[]> {
    const connection = await this.getConnection();
    const queryResult: T[] = await new Promise((resolve, reject) =>
      connection.query(query, (error, result) => (error ? reject(error) : resolve(result))),
    );
    connection.release();
    return queryResult;
  }

  async logParamValue(
    nodeId: string,
    paramId: string,
    value: number,
    loggingType: LoggingType,
  ): Promise<void> {
    const tableName = this._generateTableName(nodeId, paramId, loggingType);
    const tableTemplate = loggingType === LoggingType.int ? LOG_TABLE_INT : LOG_TABLE_DOUBLE;
    await this.createTableIfNotExists(tableTemplate, tableName);

    await this.query({
      sql: `INSERT INTO ?? (\`value\`) VALUES(?);`,
      values: [tableName, value],
    });
  }

  async writeParamValue(nodeId: string, paramId: string, value: number): Promise<void> {
    await this.createTableIfNotExists(PARAM_TABLE, PARAM_TABLE_NAME);

    await this.query({
      sql: `INSERT INTO ?? (\`node\`, \`param\`, \`value\`) VALUES(?,?,?) ON DUPLICATE KEY UPDATE \`value\`=?`,
      values: [PARAM_TABLE_NAME, nodeId, paramId, value, value],
    });
  }

  async getLoggingType(nodeId: string, paramId: string): Promise<LoggingType> {
    const results = await this.query<NodeLogging>({
      sql: `SELECT \`logging\` FROM ?? WHERE \`node\`=? AND \`param\`=? LIMIT 1`,
      values: [PARAM_TABLE_NAME, nodeId, paramId],
    });
    return (results && results[0].logging) || LoggingType.no;
  }

  async readParamValue(nodeId: string, paramId: string): Promise<number> {
    const results = await this.query<NodeParam>({
      sql: `SELECT \`value\` FROM ?? WHERE \`node\`=? AND \`param\`=? LIMIT 1`,
      values: [PARAM_TABLE_NAME, nodeId, paramId],
    });
    return results && results[0]?.value;
  }

  async readNodeParams(nodeId: string): Promise<NodeParamsDto> {
    const results = await this.query<NodeParam>({
      sql: `SELECT \`value\` FROM ?? WHERE \`node\`=?`,
      values: [PARAM_TABLE_NAME, nodeId],
    });
    return new NodeParamsDto(results);
  }

  async createTableIfNotExists(query: string, tableName: string): Promise<void> {
    if (this._tableCache[tableName]) return;

    await this.query({ sql: query, values: [tableName] });

    this._tableCache[tableName] = true;
  }

  private async _createDbIfNotExists(): Promise<void> {
    this._logger.log('Checking for database');
    try {
      const connection = createConnection({
        host: this._configService.get<string>(Config.mySqlUrl) || DEFAULT_MYSQL.host,
        port: this._configService.get<number>(Config.mySqlPort) || DEFAULT_MYSQL.port,
        user: this._configService.get<string>(Config.mySqlUser),
        password: this._configService.get<string>(Config.mySqlPassword),
      });

      await new Promise((resolve, reject) =>
        connection.connect(error => (error ? reject(error) : resolve())),
      );

      await new Promise((resolve, reject) =>
        connection.query(
          {
            sql: 'CREATE DATABASE IF NOT EXISTS ??;',
            values: ['iot'],
          },
          error => (error ? reject(error) : resolve()),
        ),
      );

      await new Promise((resolve, reject) =>
        connection.end(error => (error ? reject(error) : resolve())),
      );

      this._logger.log('Database checked');
    } catch (error) {
      this._logger.error('Failed checking database', error?.message);
      throw new Error(error?.message);
    }
  }

  private _generateTableName(nodeId: string, sensorId: string, loggingType: LoggingType): string {
    const nodeIdCleaned = sanitizeName(nodeId);
    const paramIdCleaned = sanitizeName(sensorId);
    const dataType = loggingType === LoggingType.int ? 'i' : 'd';
    return `${VALUE_TABLE_PREFIX}_${nodeIdCleaned}_${paramIdCleaned}_${dataType}`;
  }
}
