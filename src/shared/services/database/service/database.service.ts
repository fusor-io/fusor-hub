import { Injectable, Logger, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createConnection, createPool, Pool, PoolConnection, QueryOptions } from 'mysql2';

import { sleep } from 'src/shared/utils/sleep';
import { inspect } from 'util';
import { DEFAULT_MYSQL } from '../../../const';
import { Config } from '../../../type';

let _recreating: Promise<void> | undefined = undefined; // lock
let _pool: Pool | undefined = undefined;

// Singleton service (Scope.DEFAULT)
@Injectable({ scope: Scope.DEFAULT })
export class DatabaseService {
  private readonly _logger = new Logger(this.constructor.name);
  private readonly _tableCache = {};

  constructor(private readonly _configService: ConfigService) {}

  async init(force = false): Promise<void> {
    if (!force && _pool) return;

    // single-flight: if someone is already recreating, just await
    if (_recreating) {
      this._logger.warn('Already recreating pool, waiting to complete...');
      await _recreating;
      return;
    }

    _recreating = (async () => {
      // close old pool if any
      if (_pool) {
        this._logger.warn('Recreating pool...');
        try {
          await this._closePool();
        } catch (error) {
          this._logger.warn(`Failed ending pool: ${inspect(error)}`);
        }

        await sleep(10000); // cool down

        _pool = undefined;
      }

      if (!force && !_pool) {
        await this._createDbIfNotExists().catch(() => {
          this._logger.error('Failed creating db');
        });
      }

      _pool = this._buildPool();
    })();

    try {
      await _recreating;
    } catch (error) {
      this._logger.error(`Failed creating pool: ${inspect(error)}`);
    } finally {
      _recreating = undefined;
    }
  }

  async getConnection(): Promise<PoolConnection> {
    await this.init();
    return new Promise((resolve, reject) =>
      _pool.getConnection((error, connection) => (error ? reject(error) : resolve(connection))),
    );
  }

  async query<T>(query: QueryOptions, retries = 3): Promise<T[]> {
    const connection = await this.getConnection();
    try {
      const queryResult: T[] = await new Promise((resolve, reject) =>
        // TODO: solve type issue for INSERT / UPDATE queries
        connection.query(query, (error, result) =>
          error ? reject(error) : resolve(result as undefined),
        ),
      );
      return queryResult;
    } catch (err) {
      this._logger.error(`Error ${err?.code} running query ${inspect(query)} - ${inspect(err)}`);
      const transient =
        err?.code === 'PROTOCOL_CONNECTION_LOST' ||
        err?.code === 'ECONNRESET' ||
        err?.code === 'ETIMEDOUT' ||
        err?.fatal === true;

      if (transient && retries > 0) {
        this._logger.warn(`DB transient error ${err?.code ?? ''}; recreating pool & retrying...`);
        try {
          this._logger.warn('Recreating pool...');
          await this.init(true);
          this._logger.warn('...pool recreated');
        } catch {
          this._logger.warn('Failed ending existing pool');
        }
        _pool = undefined;
        // waiting a bit to allow mysql to solve any internal issues
        await sleep(10000);

        return this.query<T>(query, retries - 1);
      }

      this._logger.error('DB query failed', err?.message);
      throw err;
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

  private _buildPool(): Pool {
    const pool = createPool({
      connectionLimit:
        this._configService.get<number>(Config.mySqlPoolSize) || DEFAULT_MYSQL.poolSize,
      waitForConnections: DEFAULT_MYSQL.waitForConnections,
      queueLimit: DEFAULT_MYSQL.queueLimit,
      trace: DEFAULT_MYSQL.trace,
      host: this._configService.get<string>(Config.mySqlUrl) || DEFAULT_MYSQL.host,
      port: this._configService.get<number>(Config.mySqlPort) || DEFAULT_MYSQL.port,
      user: this._configService.get<string>(Config.mySqlUser),
      password: this._configService.get<string>(Config.mySqlPassword),
      database: this._configService.get<string>(Config.mySqlDb),
    });

    pool.on('connection', (conn: any) => {
      this._logger.log('Enabling keep alive for connection');
      if (conn.stream?.setKeepAlive) {
        conn.stream.setKeepAlive(true, 1000);
      } else {
        this._logger.warn('Unable to set keep alive time');
      }
    });

    pool.on('error', (e: any) => {
      this._logger.warn(`Pool error: ${e?.code || e?.message}`);
    });

    return pool;
  }

  private async _closePool(): Promise<void> {
    if (!_pool) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      _pool.end((err?: Error) => (err ? reject(err) : resolve()));
    });
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
