/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Auth, google } from 'googleapis';

import { Config } from '../../../type';
import { DefinitionKey, DefinitionsService, DefinitionType } from '../../definitions';
import { GOOGLE_API_SCOPES } from '../const';
import { GoogleApiAccessType } from '../type';

@Injectable()
export class GoogleSignInService {
  private _oAuth2Client: Auth.OAuth2Client;

  constructor(
    private readonly _configService: ConfigService,
    private readonly _definitionsService: DefinitionsService,
  ) {}

  get oAuth2Client(): Auth.OAuth2Client {
    if (!this._oAuth2Client) {
      const clientId = this._configService.get<string>(Config.googleApiClientId);
      const clientSecret = this._configService.get<string>(Config.googleApiSecret);
      const redirectUrl = `${this._configService.get<string>(
        Config.hostUrl,
      )}/google-sign-in/success`;
      this._oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
    }
    return this._oAuth2Client;
  }

  get authUrl(): string {
    return this.oAuth2Client.generateAuthUrl({
      access_type: GoogleApiAccessType.offline,
      scope: GOOGLE_API_SCOPES,
    });
  }

  async getClientWithCredentials(): Promise<Auth.OAuth2Client> {
    const credentials = await this.getCredentials();
    const auth = this.oAuth2Client;
    auth.setCredentials(credentials);
    return auth;
  }

  async getCredentials(): Promise<Auth.Credentials> {
    const definition = await this._definitionsService.readDefinition<Auth.Credentials>(
      DefinitionType.config,
      DefinitionKey.googleApi,
    );
    return definition?.definition;
  }

  async loadAuthTokens(): Promise<Auth.Credentials> {
    const existingTokenResult = await this._definitionsService.readDefinition<Auth.Credentials>(
      DefinitionType.config,
      DefinitionKey.googleApi,
    );
    return existingTokenResult?.definition;
  }

  async saveAuthTokens(tokens: Auth.Credentials): Promise<void> {
    if (!tokens) return;

    const existingTokens = await this.loadAuthTokens();

    const refreshToken = existingTokens
      ? // eslint-disable-next-line @typescript-eslint/camelcase
        { refresh_token: existingTokens?.refresh_token }
      : {};

    await this._definitionsService.saveDefinition(DefinitionType.config, DefinitionKey.googleApi, {
      ...refreshToken,
      ...tokens,
    });
  }
}
