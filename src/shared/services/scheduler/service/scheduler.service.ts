import { scheduleJob } from 'node-schedule';
import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from 'src/shared/services/firebase/service/firebase.service';
import { AggregateViewValue } from 'src/shared/services/aggregates/type';
import { ParamsService } from 'src/shared/services/params/service/params.service';
import { AggregatesService } from 'src/shared/services/aggregates/service/aggregates.service';
import { AggregateViewGrouping } from 'src/shared/services/aggregates/type';
import { ExportType } from 'src/shared/services/params/type';

// @see https://www.npmjs.com/package/node-schedule

@Injectable()
export class SchedulerService {
  private readonly _logger = new Logger(this.constructor.name);
  constructor(
    private readonly _aggregateService: AggregatesService,
    private readonly _paramsService: ParamsService,
    private readonly _firebaseService: FirebaseService,
  ) {}

  public scheduleJobs(): void {
    this._logger.log('Scheduling jobs...');
    this._minuteJobs();
    this._hourJobs();
    this._logger.log('...jobs scheduled');
  }

  private _minuteJobs(): void {
    scheduleJob('min15', { second: 0 }, () => {
      this._min15();
    });
    scheduleJob('hour1', { second: 5 }, () => {
      this._hour1();
    });
    scheduleJob('hour2', { second: 10 }, () => {
      this._hour2();
    });
    scheduleJob('day1', { second: 15 }, () => {
      this._day1();
    });
    scheduleJob('day2', { second: 20 }, () => {
      this._day2();
    });
  }

  private _hourJobs(): void {
    scheduleJob('week1', { minute: 0, second: 25 }, () => {
      this._week1();
    });
    scheduleJob('day10', { minute: 0, second: 30 }, () => {
      this._day10();
    });
    scheduleJob('month1', { minute: 0, second: 35 }, () => {
      this._month1();
    });
  }

  private _min15() {
    const endTime = Date.now();
    const startTime = endTime - 15 * 60 * 1000;
    this._buildView(startTime, endTime, ExportType.min15, AggregateViewGrouping.by1Minute);
  }

  private _hour1() {
    const endTime = Date.now();
    const startTime = endTime - 60 * 60 * 1000;
    this._buildView(startTime, endTime, ExportType.hour1, AggregateViewGrouping.by1Minute);
  }

  private _hour2() {
    const endTime = Date.now();
    const startTime = endTime - 120 * 60 * 1000;
    this._buildView(startTime, endTime, ExportType.hour2, AggregateViewGrouping.by1Minute);
  }

  private _day1() {
    const endTime = Date.now();
    const startTime = endTime - 24 * 60 * 60 * 1000;
    this._buildView(startTime, endTime, ExportType.day1, AggregateViewGrouping.by30Minutes);
  }

  private _day2() {
    const endTime = Date.now();
    const startTime = endTime - 2 * 24 * 60 * 60 * 1000;
    this._buildView(startTime, endTime, ExportType.day2, AggregateViewGrouping.by1Hour);
  }

  private _week1() {
    const endTime = Date.now();
    const startTime = endTime - 7 * 24 * 60 * 60 * 1000;
    this._buildView(startTime, endTime, ExportType.week1, AggregateViewGrouping.by3Hours);
  }

  private _day10() {
    const endTime = Date.now();
    const startTime = endTime - 10 * 24 * 60 * 60 * 1000;
    this._buildView(startTime, endTime, ExportType.day10, AggregateViewGrouping.by6Hours);
  }

  private _month1() {
    const endTime = Date.now();
    const startTime = endTime - 30 * 24 * 60 * 60 * 1000;
    this._buildView(startTime, endTime, ExportType.month1, AggregateViewGrouping.by12Hours);
  }

  private async _buildView(
    startTime: number,
    endTime: number,
    exportType: ExportType,
    grouping: AggregateViewGrouping,
  ) {
    this._logger.log(`Running ${exportType} job`);

    const params = await this._paramsService.getExports(exportType);
    if (!params?.length) return;

    for (const param of params) {
      this._logger.log(`Updating view for ${param.node}_${param.param}`);

      try {
        const summary = await this._aggregateService.aggregateParam(
          param.node,
          param.param,
          startTime / 1000,
          endTime / 1000,
          grouping,
          [AggregateViewValue.average],
        );

        const exportValue = summary.reduce((accumulator, param) => {
          accumulator[param.frame] = param.avg;
          return accumulator;
        }, {});

        await this._firebaseService.updateView(
          exportType,
          `${param.node}_${param.param}`,
          exportValue,
        );
      } catch (error) {
        this._logger.error('Failed updating view', error);
      }
    }
  }
}
