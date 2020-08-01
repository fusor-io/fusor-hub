import { Injectable, Logger } from '@nestjs/common';
import { DefinitionsService } from 'src/shared/services/definitions/service/definitions.service';
import { ParamsService } from 'src/shared/services/params/service/params.service';

import { EXPORTER_DEFINITION_TYPE } from '../../const';
import {
  ExporterConfigFirebase,
  ExporterDefinition,
  ExporterInstance,
  ExporterMap,
  ExporterScheduleType,
  ExporterTarget,
  isExporterParamExact,
} from '../../type';
import { CollectorService } from '../collector/collector.service';
import { FirebaseSaverService } from '../fire-base-saver/firebase-saver.service';

@Injectable()
export class ExporterService {
  private readonly _logger = new Logger(this.constructor.name);

  private _instantExporters: ExporterMap = {};
  private _cronExporters: ExporterInstance[] = [];

  private _pLoading = undefined;
  private _isReady = false;

  constructor(
    private readonly _paramsService: ParamsService,
    private readonly _definitionsService: DefinitionsService,
    private readonly _collectorService: CollectorService,
    private readonly _firebaseSaverService: FirebaseSaverService,
  ) {
    this.instantiateExporters();
  }

  async getCronExporter(): Promise<ExporterInstance[]> {
    if (!this._isReady) await this.loadExporters();
    return this._cronExporters;
  }

  async getInstantExporter(): Promise<ExporterMap> {
    if (!this._isReady) await this.loadExporters();
    return this._instantExporters;
  }

  async loadExporters(): Promise<boolean> {
    if (this._pLoading) return this._pLoading;

    this._pLoading = this.instantiateExporters();
    this._logger.log('Loading exporters');

    try {
      const [definitionCount, instanceCount] = await this._pLoading;
      this._logger.log(
        `${definitionCount} definitions loaded, ${instanceCount} exporters instantiated`,
      );

      this._pLoading = undefined;
      this._isReady = true;
      return true;
    } catch (error) {
      this._logger.error('Failed loading exporter definitions', error);

      this._pLoading = undefined;
      return false;
    }
  }

  async instantiateExporters(): Promise<[number, number]> {
    const definitions = await this._definitionsService.readDefinitions<ExporterDefinition>(
      EXPORTER_DEFINITION_TYPE,
    );

    const allInstances: ExporterInstance[] = [];

    for (const definition of definitions) {
      const instances = await this._populateInstances(definition.definition);
      allInstances.push(...instances);
    }

    this._instantExporters = this._mapInstantExporters(allInstances);

    this._cronExporters = allInstances.filter(
      instance => instance?.schedule?.type === ExporterScheduleType.cron,
    );

    return [definitions.length, allInstances.length];
  }

  private async _populateInstances(definition: ExporterDefinition): Promise<ExporterInstance[]> {
    if (!definition?.collection) return [];

    const filter = definition.collection.filter || {};

    let nodeMatch = '.*';
    let paramMatch = '.*';

    if (isExporterParamExact(filter)) {
      if (filter.node) nodeMatch = `^${filter.node}$`;
      if (filter.param) paramMatch = `^${filter.param}$`;
    } else {
      if (filter.nodeMatch) nodeMatch = filter.nodeMatch;
      if (filter.paramMatch) paramMatch = filter.paramMatch;
    }

    const sources = await this._paramsService.regexpParams(nodeMatch, paramMatch);

    return sources.map(source => ({
      source: {
        type: definition.collection.type,
        selector: { node: source.node, param: source.param },
        config: definition.collection.config,
      },
      target: definition.target,
      output: definition.output,
      schedule: definition.schedule,
    }));
  }

  async exportParam(node: string, param: string): Promise<void> {
    const allInstantExporters = await this.getInstantExporter();
    const exporters = allInstantExporters[this._key(node, param)] || [];

    for (const exporter of exporters) {
      await this.export(exporter);
    }
  }

  async export(exporter: ExporterInstance): Promise<void> {
    try {
      const { node, param } = exporter?.source?.selector;
      const output = await this._collectorService.collect(exporter?.source);

      const target = exporter?.target;

      this._logger.log(`Exporting param ${node}:${param} to ${target}`);
      switch (target) {
        case ExporterTarget.firebase: {
          await this._firebaseSaverService.save(
            node,
            param,
            exporter?.output as ExporterConfigFirebase,
            output,
          );
          return;
        }
        case ExporterTarget.googleSheet: {
          return;
        }
        default:
          throw new Error(`Unsupported target ${target}`);
      }
    } catch (error) {
      this._logger.error(`Failed param export ${JSON.stringify(exporter)}`, error);
    }
  }

  private _mapInstantExporters(instances: ExporterInstance[]): ExporterMap {
    return instances
      .filter(instance => instance?.schedule?.type === ExporterScheduleType.onParamUpdate)
      .reduce((result, instance) => {
        const { node, param } = instance?.source?.selector;
        const key = this._key(node, param);

        if (result[key]) {
          result[key].push(instance);
        } else {
          result[key] = [instance];
        }
        return result;
      }, {});
  }

  private _key(node: string, param: string): string {
    return `${node}:${param}`;
  }
}
