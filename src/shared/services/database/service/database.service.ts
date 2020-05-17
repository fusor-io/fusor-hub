import { createPool, createConnection, Pool, PoolConnection, QueryOptions } from 'mysql';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Config } from 'src/shared/type';
import { DEFAULT_MYSQL } from 'src/shared/const';

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

  async createTableIfNotExists(query: string, tableName: string): Promise<void> {
    if (this._tableCache[tableName]) return;

    try {
      await this.query({ sql: query, values: [tableName] });
    } catch (error) {
      this._logger.error(`Failed creating table ${tableName}`, error?.message);
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
}
