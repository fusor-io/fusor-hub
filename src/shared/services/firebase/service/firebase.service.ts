import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fireBase from 'firebase-admin';
import * as fs from 'fs';

import { Config } from '../../../type';
import { cleanFbNodeName } from '../../../utils';
import { ExportType } from '../../params';

// @see https://firebase.google.com/docs/admin/setup
// @see https://firebase.google.com/docs/reference/js/firebase.database.Reference

@Injectable()
export class FirebaseService {
  private readonly _logger = new Logger(this.constructor.name);
  private _config: object;
  private _dbReference: fireBase.database.Reference;
  private _varReference: fireBase.database.Reference;
  private _viewReference: fireBase.database.Reference;

  private _defaultVarPath: string;
  private _defaultViewPath: string;

  constructor(private readonly _configService: ConfigService) {
    if (this._loadConfig()) this._initService();
  }

  public async saveVar(
    value: number | object,
    path: string,
    root = this._defaultVarPath,
  ): Promise<void> {
    if (!this.isAvailable) return;
    const fullPath = cleanFbNodeName([root, path].filter(item => item).join('/'));
    try {
      await this._dbReference.child(fullPath).set(value);
    } catch (error) {
      this._logger.error(`Failed saving to FireBase: ${path}`, error);
    }
  }

  public async saveView(value: object, path: string, root = this._defaultViewPath): Promise<void> {
    if (!this.isAvailable) return;
    const fullPath = cleanFbNodeName([root, path].filter(item => item).join('/'));
    try {
      await this._dbReference.child(fullPath).set(value);
    } catch (error) {
      this._logger.error(`Failed saving to FireBase: ${path}`, error);
    }
  }

  public async updateVar(varName: string, value: number): Promise<void> {
    if (!this.isAvailable) return;
    try {
      await this._varReference.child(cleanFbNodeName(varName)).set(value);
    } catch (error) {
      this._logger.error(`Failed updating FireBase: ${varName}=${value}`, error);
    }
  }

  public async updateView(viewType: ExportType, varName: string, value: object): Promise<void> {
    if (!this.isAvailable) return;
    const path = cleanFbNodeName(`${varName}:${viewType}`);
    try {
      await this._viewReference.child(path).set(value);
    } catch (error) {
      this._logger.error(`Failed updating FireBase: ${path}`, error);
    }
  }

  get isAvailable(): boolean {
    return !!this._config;
  }

  private _loadConfig(): boolean {
    try {
      this._logger.log('Loading Firebase config...');
      const config = fs.readFileSync('firebase-config.json', 'utf8');
      this._config = JSON.parse(config);
      this._logger.log('...config loaded');
      return true;
    } catch (error) {
      this._logger.error('...failed loading config', error);
      return false;
    }
  }

  private _initService(): void {
    const dbUrl = this._configService.get<string>(Config.firebaseDb);
    this._defaultVarPath = this._configService.get<string>(Config.firebaseDbPathVar) || 'var';
    this._defaultViewPath = this._configService.get<string>(Config.firebaseDbPathView) || 'view';

    this._logger.log(
      `Connecting to database ${dbUrl}:[${this._defaultVarPath},${this._defaultViewPath}]`,
    );

    fireBase.initializeApp({
      credential: fireBase.credential.cert(this._config),
      databaseURL: dbUrl,
    });

    this._dbReference = fireBase.database().ref();
    this._varReference = this._dbReference.child(this._defaultVarPath);
    this._viewReference = this._dbReference.child(this._defaultViewPath);
  }
}
