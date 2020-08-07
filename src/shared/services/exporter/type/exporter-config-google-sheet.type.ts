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
  dimension: ExporterConfigGoogleSheetDimension;
  lookupRange: string;
  lookupKey: string;
  targetColumn: string;
}

export interface ExporterConfigGoogleSheetRangeAddress {
  dimension: ExporterConfigGoogleSheetDimension;
  startCell: string;
}

export interface ExporterConfigGoogleSheet {
  spreadsheetId: string;
  sheetId: string;
  type?: ExporterConfigGoogleSheetType;
  destination:
    | ExporterConfigGoogleSheetCellAddress
    | ExporterConfigGoogleSheetCellLookup
    | ExporterConfigGoogleSheetRangeAddress;
}
