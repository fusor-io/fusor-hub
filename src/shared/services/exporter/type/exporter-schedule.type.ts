export enum ExporterScheduleType {
  onParamUpdate = 'on-update',
  cron = 'cron',
}

export interface ExporterScheduleCronConfig {
  schedule: string;
}

export interface ExporterSchedule {
  type: ExporterScheduleType;
  config?: ExporterScheduleCronConfig;
}
