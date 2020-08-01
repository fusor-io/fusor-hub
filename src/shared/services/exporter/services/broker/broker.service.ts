import { Injectable } from '@nestjs/common';
import { scheduleJob } from 'node-schedule';
import { ParamsService } from 'src/shared/services/params/service/params.service';

import { ExporterService } from '../exporter/exporter.service';

@Injectable()
export class ExportBrokerService {
  constructor(
    private readonly _exporter: ExporterService,
    private readonly _paramsService: ParamsService,
  ) {
    this._paramsService.registerWriteHook((nodeId, paramId) => this.onParamUpdate(nodeId, paramId));
    this._schedule();
  }

  onParamUpdate(node: string, param: string) {
    this._exporter.exportParam(node, param);
  }

  private async _schedule() {
    await new Promise(resolve => setTimeout(resolve, 5000));

    const exporterInstances = await this._exporter.getCronExporter();
    for (const instance of exporterInstances) {
      const { node, param } = instance?.source?.selector || {};
      const schedule = instance?.schedule?.config?.schedule;
      const name = `${node}:${param}`;

      scheduleJob(name, schedule, () => {
        this._exporter.export(instance);
      });
    }
  }
}
