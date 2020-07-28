import { unitOfTime } from 'moment';
import { AggregateViewGrouping, AggregateViewValue } from 'src/shared/services/aggregates/type';

import { ExporterConfigFirebase } from './exporter-config-firebase.type';
import { ExporterConfigGoogleSheet } from './exporter-config-google-sheet.type';
import { ExporterSchedule } from './exporter-schedule.type';

export enum ExporterType {
  singleValue = 'single-value',
  aggregate = 'aggregate',
}

export enum ExporterTarget {
  firebase = 'firebase',
  googleSheet = 'google-sheet',
}

export interface ExporterParamExact {
  node?: string;
  param?: string;
}

export interface ExporterParamRegexp {
  nodeMatch?: string; // regexp
  paramMatch?: string; // regexp
}

export type ExporterParamFilter = ExporterParamExact | ExporterParamRegexp;

export interface TimeOffset {
  unit: unitOfTime.DurationConstructor;
  value: number;
}

export interface ExporterAggregateConfig {
  grouping: AggregateViewGrouping;
  operation?: AggregateViewValue;
  startOffset: TimeOffset;
}

export interface ExporterCollection {
  type: ExporterType;
  filter: ExporterParamFilter;
  config: ExporterAggregateConfig | undefined;
}

export type ExporterOutputConfig = ExporterConfigFirebase | ExporterConfigGoogleSheet;

export interface ExporterDefinition {
  collection: ExporterCollection;
  target: ExporterTarget;
  output: ExporterOutputConfig;
  schedule: ExporterSchedule;
}
