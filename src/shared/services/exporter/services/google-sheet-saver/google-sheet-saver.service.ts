import { Injectable } from '@nestjs/common';

import { CollectorResults, ExporterConfigGoogleSheet, ExporterConfigGoogleSheetType } from '../../type';

/**
 * @see https://codelabs.developers.google.com/codelabs/sheets-api/#4
 * @see https://developers.google.com/identity/sign-in/web/
 *
 */

@Injectable()
export class GoogleSheetSaverService {
    
  async save(config: ExporterConfigGoogleSheet, value: CollectorResults): Promise<void> {
    return Array.isArray(value) ? this.saveMany(config, value) : this.saveOne(config, value);
  }

  async saveOne(config: ExporterConfigGoogleSheet, value: number): Promise<void> {
    const {
      spreadsheetId,
      sheetId,
      type = ExporterConfigGoogleSheetType.cellAddress,
      destination,
    } = config;
  }

  async saveMany(config: ExporterConfigGoogleSheet, value: CollectorAggregate): Promise<void> {
    return;
  }
}
