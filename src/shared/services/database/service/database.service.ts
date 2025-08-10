import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createConnection,
  createPool,
  Pool,
  PoolConnection,
  QueryOptions,
} from 'mysql2';

import { DEFAULT_MYSQL } from '../../../const';
import { Config } from '../../../type';

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
        waitForConnections: DEFAULT_MYSQL.waitForConnections,
        queueLimit: DEFAULT_MYSQL.queueLimit,
        trace: DEFAULT_MYSQL.trace,
        enableKeepAlive: true,

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
    try {
      const queryResult: T[] = await new Promise((resolve, reject) =>
        // TODO: solve type issue for INSERT / UPDATE queries
        connection.query(query, (error, result) => (error ? reject(error) : resolve(result as undefined))),
      );
      return queryResult;
    } finally {
      connection.release();
    }
  }

  async createTableIfNotExists(query: string, tableName: string): Promise<void> {
    if (this._tableCache[tableName]) return;

    try {
      await this.query({ sql: query.replace('#', tableName) });
    } catch (error) {
      this._logger.error(
        `Failed creating table ${tableName}: ${JSON.stringify(query)}`,
        error?.message,
      );
      throw error;
    }

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
        connection.connect(error => (error ? reject(error) : resolve(true))),
      );

      await new Promise((resolve, reject) =>
        connection.query(
          {
            sql: 'CREATE DATABASE IF NOT EXISTS ??;',
            values: ['iot'],
          },
          error => (error ? reject(error) : resolve(true)),
        ),
      );

      await new Promise((resolve, reject) =>
        connection.end(error => (error ? reject(error) : resolve(true))),
      );

      this._logger.log('Database checked');
    } catch (error) {
      this._logger.error('Failed checking database', error?.message);
      throw new Error(error?.message);
    }
  }
}
