import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Auth, google } from 'googleapis';
import { Config } from 'src/shared/type';

import { GOOGLE_API_SCOPES } from '../ const';
import { GoogleApiAccessType } from '../type';

@Injectable()
export class GoogleSignInService {
  private _oAuth2Client: Auth.OAuth2Client;

  constructor(
    private readonly _configService: ConfigService,
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
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_type: GoogleApiAccessType.offline,
      scope: GOOGLE_API_SCOPES,
    });
  }
}
