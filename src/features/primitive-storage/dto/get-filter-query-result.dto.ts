export interface GetFilterQueryResultItem {
  node: string;
  param: string;
  value: number;
}

export type GetFilterQueryResultItemFlat = [string, string, number];

export type GetFilterQueryResult = GetFilterQueryResultItem[] | GetFilterQueryResultItemFlat[];
