import { Injectable } from '@nestjs/common';
import { Job, JobCallback, RecurrenceRule, RecurrenceSpecDateRange, RecurrenceSpecObjLit, scheduleJob } from 'node-schedule';

@Injectable()
export class CronService {
  private readonly _groups: Record<string, Job[]> = {};

  schedule(
    parent: object,
    name: string,
    rule: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number,
    callback: JobCallback,
  ): void {
    const group = parent.constructor.name;
    if (!this._groups[group]) this._groups[group] = [];
    this._groups[group].push(scheduleJob(name, rule, callback));
  }

  cancel(parent: object): void {
    const group = parent.constructor.name;
    const jobs = this._groups[group];
    if (jobs?.length) {
      jobs.forEach(job => job.cancel(false));
      delete this._groups[group];
    }
  }
}
