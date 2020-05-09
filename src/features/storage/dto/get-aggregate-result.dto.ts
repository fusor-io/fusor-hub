export interface NodeResults {
  [paramId: string]: number;
}

export interface AggregateResults {
  [nodeId: string]: NodeResults;
}
