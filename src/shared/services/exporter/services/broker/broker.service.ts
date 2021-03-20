import { Injectable, Logger } from '@nestjs/common';
import { scheduledJobs, scheduleJob } from 'node-schedule';
import { ParamsService } from 'src/shared/services/params/service/params.service';
import { ParamEntry } from 'src/shared/services/params/type';

import { ExporterService } from '../exporter/exporter.service';

@Injectable()
export class ExportBrokerService {
  private readonly _logger = new Logger(this.constructor.name);
  constructor(
    private readonly _exporter: ExporterService,
    private readonly _paramsService: ParamsService,
  ) {
    this._paramsService.registerWriteHook((nodeId, paramId) => this.onParamUpdate(nodeId, paramId));
    this._init();

    // check if we need reloading exporters each 5 minutes
    setInterval(() => this._reloadExporters(), 5 * 60 * 1000);
  }

  onParamUpdate(node: string, param: string) {
    this._exporter.exportParam(node, param);
  }

  reload() {
    this._reloadExporters(true);
  }

  private async _initialParamExport() {
    this._logger.log('Running initial param export...');
    const allParams: ParamEntry[] = await this._paramsService.filterParams('', '');
    for (const param of allParams) {
      await this._exporter.exportParam(param.node, param.param);
    }
    this._logger.log('Initial param export complete');
  }

  private async _reloadExporters(forcedReload = false) {
    if (forcedReload) {
      this._logger.log('Reloading exporter');
    } else {
      this._logger.log('Checking definitions...');

      const [definitionsUpdated, paramListUpdated] = await Promise.all([
        this._exporter.areDefinitionsUpdated(),
        this._exporter.areParamListUpdated(),
      ]);

      if (!definitionsUpdated && !paramListUpdated) {
        this._logger.log('...no updates');
        return;
      }
      this._logger.log('Updates detected, reloading exporter');
    }

    Object.keys(scheduledJobs).forEach(jobName => {
      this._logger.log(`Canceling ${jobName}`);
      scheduledJobs[jobName].cancel();
    });
    await this._exporter.loadExporters();
    await this._scheduleJobs();
  }

  private async _scheduleJobs(): Promise<void> {
    const exporterInstances = await this._exporter.getCronExporter();

    for (const instance of exporterInstances) {
      const schedule = instance?.schedule?.config?.schedule;

      this._logger.log(`Scheduling ${instance.id}`);
      scheduleJob(instance.id, schedule, () => {
        this._exporter.export(instance);
      });

      this._logger.log(`Initial run of ${instance.id}`);
      await this._exporter.export(instance);
    }
  }

  private async _init() {
    await new Promise(resolve => setTimeout(resolve, 5000));
    await this._scheduleJobs();
    await this._initialParamExport();
  }
}
