import { ExportType } from 'src/shared/services/params/type';
import { Config } from 'src/shared/type';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as fireBase from 'firebase-admin';
import { cleanFbNodeName } from 'src/shared/utils';

// @see https://firebase.google.com/docs/admin/setup

@Injectable()
export class FirebaseService {
  private readonly _logger = new Logger(this.constructor.name);
  private _config: object;
  private _varReference: fireBase.database.Reference;
  private _viewReference: fireBase.database.Reference;

  constructor(private readonly _configService: ConfigService) {
    if (this._loadConfig()) this._initService();
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
    const path = cleanFbNodeName(`${varName}_${viewType}`);
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
    const varPath = this._configService.get<string>(Config.firebaseDbPathVar) || 'var';
    const viewPath = this._configService.get<string>(Config.firebaseDbPathView) || 'view';

    this._logger.log(`Connecting to database ${dbUrl}:[${varPath},${viewPath}]`);

    fireBase.initializeApp({
      credential: fireBase.credential.cert(this._config),
      databaseURL: dbUrl,
    });

    this._varReference = fireBase
      .database()
      .ref()
      .child(varPath);

    this._viewReference = fireBase
      .database()
      .ref()
      .child(viewPath);
  }
}
