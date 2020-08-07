/* eslint-disable @typescript-eslint/camelcase */
import { Injectable, Logger } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import { GoogleSignInService } from 'src/shared/services/google-sign-in/service/google-sign-in.service';

import {
  CollectorAggregate,
  CollectorResults,
  ExporterConfigGoogleSheet,
  ExporterConfigGoogleSheetCellAddress,
  ExporterConfigGoogleSheetCellLookup,
  ExporterConfigGoogleSheetType,
} from '../../type';

/**
 * @see https://codelabs.developers.google.com/codelabs/sheets-api/#4
 * @see https://developers.google.com/identity/sign-in/web/
 *
 */

@Injectable()
export class GoogleSheetSaverService {
  private readonly _logger = new Logger(this.constructor.name);

  constructor(private readonly _googleSignInService: GoogleSignInService) {}

  async save(
    node: string,
    param: string,
    config: ExporterConfigGoogleSheet,
    value: CollectorResults,
  ): Promise<void> {
    return Array.isArray(value)
      ? this.saveMany(config, value)
      : this.saveOne(node, param, config, value);
  }

  async saveOne(
    node: string,
    param: string,
    config: ExporterConfigGoogleSheet,
    value: number,
  ): Promise<void> {
    const {
      spreadsheetId,
      sheetId,
      type = ExporterConfigGoogleSheetType.cellAddress,
      destination = {},
    } = config || {};

    try {
      switch (type) {
        case ExporterConfigGoogleSheetType.cellAddress: {
          const {
            range = `${node}.${param}`,
          } = destination as ExporterConfigGoogleSheetCellAddress;
          await this.writeCell(spreadsheetId, sheetId, range, value);
          return;
        }
        case ExporterConfigGoogleSheetType.cellLookup: {
          const {
            lookupRange = 'A:A',
            lookupKey = `${node}.${param}`,
            targetColumn = '',
          } = destination as ExporterConfigGoogleSheetCellLookup;

          await this.lookupAndWriteCell(
            spreadsheetId,
            sheetId,
            lookupRange,
            lookupKey,
            targetColumn || String.fromCharCode(lookupRange.charCodeAt(0) + 1), // TODO resolve edge cases
            value,
          );
        }
        default:
          return;
      }
    } catch (error) {
      this._logger.error(`Failed updating sheet: ${JSON.stringify({ config, value, error })}`);
    }
  }

  async saveMany(config: ExporterConfigGoogleSheet, value: CollectorAggregate): Promise<void> {
    return;
  }

  async writeCell(
    spreadsheetId: string,
    sheetId: string,
    range: string,
    value: number | string,
  ): Promise<void> {
    const auth = await this._googleSignInService.getClientWithCredentials();
    const sheets = google.sheets({ version: 'v4', auth });

    const values = [[value]];
    const requestBody = { values };

    return await new Promise((resolve, reject) =>
      sheets.spreadsheets.values.update(
        {
          spreadsheetId,
          range: `${sheetId}!${range}`,
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
  }

  async lookupAndWriteCell(
    spreadsheetId: string,
    sheetId: string,
    lookupRange: string,
    lookupKey: string,
    writeColumn: string,
    value: number | string,
  ): Promise<void> {
    const index = await this.lookupIndex(spreadsheetId, sheetId, lookupRange, lookupKey);
    const cell = `${writeColumn}${index}`;
    const writeRange = `${cell}:${cell}`;
    await this.writeCell(spreadsheetId, sheetId, writeRange, value);
  }

  async readColumn(
    spreadsheetId: string,
    sheetId: string,
    range: string,
  ): Promise<sheets_v4.Schema$ValueRange> {
    const auth = await this._googleSignInService.getClientWithCredentials();
    const sheets = google.sheets({ version: 'v4', auth });

    const result = await new Promise((resolve, reject) =>
      sheets.spreadsheets.values.get(
        {
          spreadsheetId,
          range: `${sheetId}!${range}`,
        },
        (error, result) =>
          error
            ? reject(error)
            : result?.status === 200
            ? resolve(result?.data)
            : reject(result?.statusText),
      ),
    );

    return result;
  }

  async lookupIndex(
    spreadsheetId: string,
    sheetId: string,
    range: string,
    key: string,
  ): Promise<number> {
    const data = await this.readColumn(spreadsheetId, sheetId, range);
    const column = data?.values?.map(row => row[0]?.toString().trim());

    const parts = /(.*)!([A-Z]+)([0-9]+):([A-Z]+)([0-9]+)/i.exec(data.range);
    const startIdx = +(parts?.[3] || '0');

    const keyLowerCase = (key || '').toLowerCase();
    const valueIdx = column.findIndex(cell => cell?.toLowerCase() === keyLowerCase);
    return startIdx + valueIdx;
  }
}
