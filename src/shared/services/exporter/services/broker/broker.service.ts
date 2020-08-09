import { Injectable, Logger } from '@nestjs/common';
import { scheduledJobs, scheduleJob } from 'node-schedule';
import { ParamsService } from 'src/shared/services/params/service/params.service';

import { ExporterService } from '../exporter/exporter.service';

@Injectable()
export class ExportBrokerService {
  private readonly _logger = new Logger(this.constructor.name);
  constructor(
    private readonly _exporter: ExporterService,
    private readonly _paramsService: ParamsService,
  ) {
    this._paramsService.registerWriteHook((nodeId, paramId) => this.onParamUpdate(nodeId, paramId));
    this._schedule();

    // reload exporters each 5 minutes
    setInterval(() => this._reloadExporters(), 5 * 60 * 1000);
  }

  onParamUpdate(node: string, param: string) {
    this._exporter.exportParam(node, param);
  }

  private async _reloadExporters() {
    this._logger.log('Reloading exporter');
    Object.keys(scheduledJobs).forEach(jobName => {
      this._logger.log(`Canceling ${jobName}`);
      scheduledJobs[jobName].cancel();
    });
    this._schedule();
  }

  private async _schedule() {
    await new Promise(resolve => setTimeout(resolve, 5000));

    const exporterInstances = await this._exporter.getCronExporter();
    for (const instance of exporterInstances) {
      const schedule = instance?.schedule?.config?.schedule;
      this._logger.log(`Scheduling ${instance.id}`);

      scheduleJob(instance.id, schedule, () => {
        this._exporter.export(instance);
      });
    }
  }
}
