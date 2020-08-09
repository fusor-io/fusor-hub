import { ExporterAggregateConfig, ExporterOutputConfig, ExporterTarget, ExporterType } from './exporter-definition.type';
import { ExporterSchedule } from './exporter-schedule.type';

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
  id: string;
  source: ExporterSource;
  target: ExporterTarget;
  output: ExporterOutputConfig;
  schedule: ExporterSchedule;
}

export interface ExporterMap {
  [node: string]: ExporterInstance[];
}
