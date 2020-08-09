import { CollectorResults } from './collector-results.type';

export interface ExporterContext {
  node: string;
  param: string;
  value: CollectorResults;
}
