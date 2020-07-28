import { ExporterSchedule } from './exporter-schedule.type';
import {
  ExporterType,
  ExporterAggregateConfig,
  ExporterTarget,
  ExporterOutputConfig,
} from './exporter-definition.type';

export interface ExporterSourceSelector {
  node: string;
  param: string;
}

export interface ExporterSource {
  type: ExporterType;
  selector: ExporterSourceSelector;
  config: ExporterAggregateConfig | undefined;
}

export interface ExporterInstance {
  source: ExporterSource;
  target: ExporterTarget;
  output: ExporterOutputConfig;
  schedule: ExporterSchedule;
}

export interface ExporterMap {
  [node: string]: ExporterInstance[];
}
