import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { DefinitionsService } from 'src/shared/services/definitions/service/definitions.service';
import { DefinitionKey, DefinitionType } from 'src/shared/services/definitions/type';

import { GoogleSignInService } from '../service/google-sign-in.service';
import { GoogleSignInResponse } from '../type/google-sign-in-response.type';

/**
 * 1. Enable Google Sheets API, by following step 1 here:
 * @see https://developers.google.com/sheets/api/quickstart/nodejs
 * 2. Set GOOGLE_API_CLIENT_ID and GOOGLE_API_SECRET in .env file
 */

@Controller('google-sign-in')
export class GoogleSignInController {
  constructor(
    private readonly _googleSignInService: GoogleSignInService,
    private readonly _definitionsService: DefinitionsService,
  ) {}

  @Get('authorize')
  async authorize(@Res() response: Response) {
    const token = await this._definitionsService.readDefinition(
      DefinitionType.config,
      DefinitionKey.googleApi,
    );
    if (!token) return response.redirect(this._googleSignInService.authUrl);

    response.status(200);
    response.send({ status: GoogleSignInResponse.alreadyAuthorized });
  }

  @Get('success')
  async saveToken(@Query('code') code: string) {
    const tokenResponse = await this._googleSignInService.oAuth2Client.getToken(code);

    await this._definitionsService.saveDefinition(
      DefinitionType.config,
      DefinitionKey.googleApi,
      tokenResponse.tokens,
    );

    return { status: GoogleSignInResponse.tokenSaved };
  }
}
