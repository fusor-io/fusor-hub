import { ExporterRef } from './exporter-jsonata.type';

export enum ExporterConfigGoogleSheetType {
  cellAddress = 'cell-address',
  cellLookup = 'cell-lookup',
  rangeAddress = 'range-address',
}

export enum ExporterConfigGoogleSheetDimension {
  rows = 'ROWS',
  columns = 'COLUMNS',
}

export interface ExporterConfigGoogleSheetCellAddress {
  range: string;
}

export interface ExporterConfigGoogleSheetCellLookup {
  // find column, by column title
  lookupRangeX: string;
  lookupKeyX: ExporterRef;

  // find row, by row title
  lookupRangeY: string;
  lookupKeyY: ExporterRef;
}

export interface ExporterConfigGoogleSheetRangeAddress {
  // dimension: ExporterConfigGoogleSheetDimension;
  startCell: string;
  appendDate: boolean;
}


export interface ExporterConfigGoogleSheet {
  spreadsheetId: string;
  sheetId: ExporterRef;
  type?: ExporterConfigGoogleSheetType;
  destination:
    | ExporterConfigGoogleSheetCellAddress
    | ExporterConfigGoogleSheetCellLookup
    | ExporterConfigGoogleSheetRangeAddress;
}
