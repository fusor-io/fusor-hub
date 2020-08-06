import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { google } from 'googleapis';
import { GoogleSignInService } from 'src/shared/services/google-sign-in/service/google-sign-in.service';

import { GoogleSignInResponse } from '../type';

/**
 * 1. Enable Google Sheets API, by following step 1 here:
 * @see https://developers.google.com/sheets/api/quickstart/nodejs
 * 2. Set GOOGLE_API_CLIENT_ID and GOOGLE_API_SECRET in .env file
 */

@Controller('google-sign-in')
export class GoogleSignInController {
  constructor(
    private readonly _googleSignInService: GoogleSignInService,
  ) {}

  @Get('authorize')
  async authorize(@Res() response: Response) {
    const tokens = await this._googleSignInService.loadAuthTokens();

    const expiryDate: number = tokens?.expiry_date;
    if (!expiryDate || expiryDate < Date.now()) {
      return response.redirect(this._googleSignInService.authUrl);
      //return response.redirect(`${url}&prompt=consent`);
    }

    response.status(200);
    response.send({ status: GoogleSignInResponse.alreadyAuthorized });
  }

  @Get('success')
  async saveToken(@Query('code') code: string) {
    const tokenResponse = await this._googleSignInService.oAuth2Client.getToken(code);

    await this._googleSignInService.saveAuthTokens(tokenResponse?.tokens);

    return { status: GoogleSignInResponse.tokenSaved };
  }

  @Get('test')
  async test() {
    const credentials = await this._googleSignInService.getCredentials();
    const auth = this._googleSignInService.oAuth2Client;
    auth.setCredentials(credentials);
    const sheets = google.sheets({ version: 'v4', auth });

    const values = [[1234]];
    const requestBody = { values };
    const result = await new Promise((resolve, reject) =>
      sheets.spreadsheets.values.update(
        {
          spreadsheetId: '1sOX2EpU_ByostGfhuAtDortGXgAiEYp80SnCh5uRXHM',
          range: 'Sheet1!B1:B1',
          valueInputOption: 'USER_ENTERED',
          requestBody,
        },
        (error, result) =>
          error
            ? reject(error)
            : result?.status === 200
            ? resolve(result?.statusText)
            : reject(result?.statusText),
      ),
    );

    return result;
  }
}
