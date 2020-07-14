export interface GetFilterQueryResultItem {
  node: string;
  param: string;
  value: number;
}

export interface GetFilterQueryResultOdataItem extends GetFilterQueryResultItem {
  '@odata.id': string;
  '@odata.etag': string;
}

export interface GetFilterQueryResultOdata {
  value: GetFilterQueryResultOdataItem[];
}

export type GetFilterQueryResultItemFlat = [string, string, number];

export type GetFilterQueryResult =
  | GetFilterQueryResultItem[]
  | GetFilterQueryResultItemFlat[]
  | GetFilterQueryResultOdata;
