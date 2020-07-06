import { Config } from 'src/shared/type';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as fireBase from 'firebase-admin';

// @see https://firebase.google.com/docs/admin/setup

@Injectable()
export class FirebaseService {
  private readonly _logger = new Logger(this.constructor.name);
  private _config: object;
  private _varReference: fireBase.database.Reference;

  constructor(private readonly _configService: ConfigService) {
    if (this._loadConfig()) this._initService();
  }

  public updateVar(varName: string, value: number): void {
    if (!this.isAvailable) return;

    try {
      this._varReference.child(varName).set(value);
    } catch (error) {
      this._logger.error(`Failed updating FireBase: ${varName}=${value}`, error);
    }
  }

  get isAvailable(): boolean {
    return !!this._config;
  }

  private _loadConfig(): boolean {
    try {
      const config = fs.readFileSync('firebase-config.json', 'utf8');
      this._config = JSON.parse(config);
      return true;
    } catch (error) {
      return false;
    }
  }

  private _initService(): void {
    fireBase.initializeApp({
      credential: fireBase.credential.cert(this._config),
      databaseURL: this._configService.get<string>(Config.firebaseDb),
    });

    this._varReference = fireBase
      .database()
      .ref()
      .child(this._configService.get<string>(Config.firebaseDbPathVar) || 'var');
  }
}
