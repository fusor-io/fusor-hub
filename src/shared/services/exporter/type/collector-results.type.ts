export interface CollectorAggregateItem {
  ts: number;
  value: number;
}

export type CollectorAggregate = CollectorAggregateItem[];

export type CollectorResults = number | CollectorAggregate;
