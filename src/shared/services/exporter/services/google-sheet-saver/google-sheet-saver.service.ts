import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import * as NodeCache from 'node-cache';
import { GoogleSignInService } from 'src/shared/services/google-sign-in/service/google-sign-in.service';

import {
  CollectorAggregate,
  ExporterConfigGoogleSheet,
  ExporterConfigGoogleSheetCellAddress,
  ExporterConfigGoogleSheetCellLookup,
  ExporterConfigGoogleSheetType,
  ExporterContext,
  ExporterRef,
} from '../../type';
import { ExporterConfigGoogleSheetRangeAddress } from './../../type/exporter-config-google-sheet.type';
import { JsonataService } from './../jsonata/jsonata.service';

/**
 * @see https://codelabs.developers.google.com/codelabs/sheets-api/#4
 * @see https://developers.google.com/identity/sign-in/web/
 *
 */

const sheetsCache = new NodeCache({ stdTTL: 5 * 60 });
const rangeCache = new NodeCache({ stdTTL: 5 * 60 });

@Injectable()
export class GoogleSheetSaverService {
  private readonly _logger = new Logger(this.constructor.name);

  private _sheets: sheets_v4.Sheets;

  constructor(
    private readonly _googleSignInService: GoogleSignInService,
    private readonly _jsonataService: JsonataService,
  ) {}

  async save(context: ExporterContext, config: ExporterConfigGoogleSheet): Promise<void> {
    const auth = await this._googleSignInService.getClientWithCredentials();
    this._sheets = google.sheets({ version: 'v4', auth });

    return Array.isArray(context.value)
      ? this._saveMany(config, context)
      : this._saveOne(config, context);
  }

  private async _saveOne(
    config: ExporterConfigGoogleSheet,
    context: ExporterContext,
  ): Promise<void> {
    const {
      spreadsheetId,
      sheetId,
      type = ExporterConfigGoogleSheetType.cellAddress,
      destination = {},
    } = config || {};

    const { node, param, value } = context;

    try {
      switch (type) {
        case ExporterConfigGoogleSheetType.cellAddress: {
          const {
            range = `${node}.${param}`,
          } = destination as ExporterConfigGoogleSheetCellAddress;
          const sheet = await this.resolveSheetRef(spreadsheetId, sheetId, context);
          await this.writeCell(spreadsheetId, sheet, range, value as number);
          return;
        }
        case ExporterConfigGoogleSheetType.cellLookup: {
          const {
            lookupRangeY = 'A:A',
            lookupKeyY = node,
            lookupRangeX = '1:1',
            lookupKeyX = param,
          } = destination as ExporterConfigGoogleSheetCellLookup;

          const lookupRefX = this._jsonataService.resolveRef(lookupKeyX, context);
          const lookupRefY = this._jsonataService.resolveRef(lookupKeyY, context);

          const sheet = await this.resolveSheetRef(spreadsheetId, sheetId, context);
          await this.lookupAndWriteCell(
            spreadsheetId,
            sheet,
            lookupRangeX,
            lookupRefX,
            lookupRangeY,
            lookupRefY,
            value as number,
          );
          return;
        }
        default:
          throw new Error('Unsupported configuration for single cell');
      }
    } catch (error) {
      if (await this._tooManyRequests(error)) {
        return this._saveOne(config, context);
      }
      this._logger.error(`Failed updating sheet: ${JSON.stringify({ config, value, error })}`);
    }
  }

  private async _saveMany(
    config: ExporterConfigGoogleSheet,
    context: ExporterContext,
  ): Promise<void> {
    const {
      spreadsheetId,
      sheetId,
      type = ExporterConfigGoogleSheetType.cellAddress,
      destination = {},
    } = config || {};

    const values = (context?.value || []) as CollectorAggregate;

    try {
      switch (type) {
        case ExporterConfigGoogleSheetType.rangeAddress: {
          const { startCell, appendDate } = destination as ExporterConfigGoogleSheetRangeAddress;

          const columnValues = appendDate
            ? values.map(item => [item.value, this.timeStampToGoogleDate(item.ts)])
            : values.map(item => [item.value]);
          const sheet = await this.resolveSheetRef(spreadsheetId, sheetId, context);
          await this.writeColumnRange(spreadsheetId, sheet, startCell, columnValues);
          return;
        }
        default:
          throw new Error('Unsupported configuration for cell range');
      }
    } catch (error) {
      if (await this._tooManyRequests(error)) {
        return this._saveMany(config, context);
      }
      this._logger.error(`Failed updating sheet: ${JSON.stringify({ config, values, error })}`);
    }
    return;
  }

  private async _tooManyRequests(error: any): Promise<boolean> {
    if (error?.response?.data?.error?.code === HttpStatus.TOO_MANY_REQUESTS) {
      this._logger.log('Quota exceeded, pausing...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      this._logger.log('...resuming');
      return true;
    }
    return false;
  }

  timeStampToGoogleDate(ts: number): number {
    // goggle sheets date is number of days from 1899 Dec 30
    // date in timestamp is seconds from 1970 Jan 1
    return ts / (24 * 60 * 60) + 25569;
  }

  async writeColumnRange(
    spreadsheetId: string,
    sheetId: string,
    startCell: string,
    values: any[][],
  ): Promise<void> {
    const [, column = 'A', row = '1'] = /([A-Z]+)([0-9]+)/i.exec(startCell || '') || [];

    const requestBody = { values };
    const startRowNum = +row;
    const endRowNum = startRowNum + values.length - 1;
    const colCount = values?.[0]?.length || 0;
    if (!colCount) throw new Error('No data to store');
    const endColumn = String.fromCharCode(column.charCodeAt(0) + colCount - 1);

    return await new Promise((resolve, reject) =>
      this._sheets.spreadsheets.values.update(
        {
          spreadsheetId,
          range: `${sheetId}!${column}${startRowNum}:${endColumn}${endRowNum}`,
          valueInputOption: 'RAW',
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

  async writeCell(
    spreadsheetId: string,
    sheetId: string,
    range: string,
    value: number | string,
  ): Promise<void> {
    const values = [[value]];
    const requestBody = { values };

    return await new Promise((resolve, reject) =>
      this._sheets.spreadsheets.values.update(
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
    lookupRangeX: string,
    lookupKeyX: string,
    lookupRangeY: string,
    lookupKeyY: string,
    value: number | string,
  ): Promise<void> {
    const indexX: string = await this.lookupIndexX(
      spreadsheetId,
      sheetId,
      lookupRangeX,
      lookupKeyX,
    );
    const indexY: number = await this.lookupIndexY(
      spreadsheetId,
      sheetId,
      lookupRangeY,
      lookupKeyY,
    );
    if (indexX === undefined || indexY === undefined) return;

    const cell = `${indexX}${indexY}`;
    const writeRange = `${cell}:${cell}`;
    await this.writeCell(spreadsheetId, sheetId, writeRange, value);
  }

  async readRange(
    spreadsheetId: string,
    sheetId: string,
    range: string,
  ): Promise<sheets_v4.Schema$ValueRange> {
    const key = `${spreadsheetId}:${sheetId}!${range}`;
    const cachedData = rangeCache.get<sheets_v4.Schema$ValueRange>(key);
    if (cachedData) return cachedData;

    const result = await new Promise((resolve, reject) =>
      this._sheets.spreadsheets.values.get(
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

    rangeCache.set(key, result);
    return result;
  }

  async lookupIndexY(
    spreadsheetId: string,
    sheetId: string,
    range: string,
    key: string,
  ): Promise<number> {
    const data = await this.readRange(spreadsheetId, sheetId, range);
    const series = (data?.values?.map(item => item?.[0]) || []).map(item =>
      (item ?? '').toString().trim(),
    );

    const [, , row = '1'] = /\w+!([A-Z]*)([0-9]*)(:.*)?/i.exec(data?.range || '');
    const startIdx = +row;

    const keyLowerCase = (key || '').toLowerCase();
    const valueIdx = series.findIndex(cell => cell?.toLowerCase() === keyLowerCase);
    if (valueIdx < 0) return undefined;
    return startIdx + valueIdx;
  }

  async lookupIndexX(
    spreadsheetId: string,
    sheetId: string,
    range: string,
    key: string,
  ): Promise<string> {
    const data = await this.readRange(spreadsheetId, sheetId, range);
    const series = (data?.values?.[0] || []).map(item => (item ?? '').toString().trim());

    const [, column = 'A'] = /\w+!([A-Z]*)([0-9]*)(:.*)?/i.exec(data?.range || '');
    const startIdx = column.charCodeAt(0);

    const keyLowerCase = (key || '').toLowerCase();
    const valueIdx = series.findIndex(cell => cell?.toLowerCase() === keyLowerCase);
    if (valueIdx < 0) return undefined;
    return String.fromCharCode(startIdx + valueIdx);
  }

  async resolveSheetRef(
    spreadsheetId: string,
    sheetRef: ExporterRef,
    context: ExporterContext,
  ): Promise<string> {
    const sheet = this._jsonataService.resolveRef(sheetRef, context);
    await this.assureSheet(spreadsheetId, sheet);
    return sheet;
  }

  async assureSheet(spreadsheetId: string, title: string): Promise<void> {
    const sheetList = await this.getSheets(spreadsheetId);
    if (sheetList.includes(title)) return;

    const requestBody = {
      requests: [
        {
          addSheet: {
            properties: { title },
          },
        },
      ],
    };

    await this._sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody,
    });
  }

  async getSheets(spreadsheetId: string): Promise<string[]> {
    const cachedData = sheetsCache.get<string[]>(spreadsheetId);
    if (cachedData) return cachedData;

    const response = await this._sheets.spreadsheets.get({ spreadsheetId });
    const sheetList = (response?.data?.sheets || [])
      .map(sheet => sheet?.properties?.title)
      .filter(title => title);

    sheetsCache.set(spreadsheetId, sheetList);
    return sheetList;
  }
}
