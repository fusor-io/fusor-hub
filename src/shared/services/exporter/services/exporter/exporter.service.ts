import { Injectable, Logger } from '@nestjs/common';

import { sleep } from '../../../../../shared/utils/sleep';
import { DefinitionQueryResult, DefinitionsService } from '../../../definitions';
import { NodeParam, ParamsService } from '../../../params';
import { EXPORTER_DEFINITION_TYPE } from '../../const';
import {
  CollectorResults,
  ExporterConfigFirebase,
  ExporterConfigGoogleSheet,
  ExporterContext,
  ExporterDefinition,
  ExporterInstance,
  ExporterMap,
  ExporterScheduleType,
  ExporterTarget,
  isExporterParamExact,
} from '../../type';
import { CollectorService } from '../collector/collector.service';
import { FirebaseSaverService } from '../fire-base-saver/firebase-saver.service';
import { GoogleSheetSaverService } from '../google-sheet-saver/google-sheet-saver.service';

@Injectable()
export class ExporterService {
  private readonly _logger = new Logger(this.constructor.name);

  private _instantExporters: ExporterMap = {};
  private _cronExporters: ExporterInstance[] = [];

  private _pLoading = undefined;
  private _isReady = false;

  private _definitions: DefinitionQueryResult<ExporterDefinition>[];
  private _paramsSnapshot: NodeParam[];

  constructor(
    private readonly _paramsService: ParamsService,
    private readonly _definitionsService: DefinitionsService,
    private readonly _collectorService: CollectorService,
    private readonly _firebaseSaverService: FirebaseSaverService,
    private readonly _googleSheetSaverService: GoogleSheetSaverService,
  ) {
    this.loadExporters();
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

    this._pLoading = this._instantiateExporters();
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

  async areDefinitionsUpdated(): Promise<boolean> {
    const definitions =
      (await this._definitionsService.readDefinitions<ExporterDefinition>(
        EXPORTER_DEFINITION_TYPE,
      )) || [];

    const oldDefinitions = this._definitions || [];

    if (oldDefinitions.length !== definitions.length) {
      return true;
    }

    return JSON.stringify(definitions) !== JSON.stringify(oldDefinitions);
  }

  async areParamListUpdated(): Promise<boolean> {
    const allParams = await this._getParamsSnapshot();
    return JSON.stringify(allParams) !== JSON.stringify(this._paramsSnapshot);
  }

  private async _instantiateExporters(): Promise<[number, number]> {
    this._definitions = await this._definitionsService.readDefinitions<ExporterDefinition>(
      EXPORTER_DEFINITION_TYPE,
    );

    this._paramsSnapshot = await this._getParamsSnapshot();

    const allInstances: ExporterInstance[] = [];

    for (const definition of this._definitions) {
      const instances = await this._populateInstances(definition.key, definition.definition);
      allInstances.push(...instances);
    }

    this._instantExporters = this._mapInstantExporters(allInstances);

    this._cronExporters = allInstances.filter(
      instance => instance?.schedule?.type === ExporterScheduleType.cron,
    );

    return [this._definitions.length, allInstances.length];
  }

  private async _populateInstances(
    key: string,
    definition: ExporterDefinition,
  ): Promise<ExporterInstance[]> {
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
      id: `${key}:${source?.node}:${source?.param}`,
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
    const { node, param } = exporter?.source?.selector || {};
    let output: CollectorResults;
    try {
      output = await this._collectorService.collect(exporter?.source);
    } catch (error) {
      if (error?.code === 'ER_NO_SUCH_TABLE') {
        this._logger.log(`Skipping export: ${error?.sqlMessage}`);
      } else {
        this._logger.warn(`Failed collecting results ${JSON.stringify({ exporter, error })}`);
        // could be that we have run out of db connections, sleep for a while
        await sleep(3000);
      }
      return;
    }

    try {
      const context: ExporterContext = { node, param, value: output };

      const target = exporter?.target;

      this._logger.log(`Exporting param ${node}:${param} to ${target}`);
      switch (target) {
        case ExporterTarget.firebase: {
          await this._firebaseSaverService.save(
            context,
            exporter?.output as ExporterConfigFirebase,
          );
          return;
        }
        case ExporterTarget.googleSheet: {
          await this._googleSheetSaverService.save(
            context,
            exporter?.output as ExporterConfigGoogleSheet,
          );
          return;
        }
        default:
          throw new Error(`Unsupported target ${target}`);
      }
    } catch (error) {
      this._logger.error(`Failed param export ${JSON.stringify(exporter)}`, error);
      // could be that we hit request limit, sleep for a while
      await sleep(5000);
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

  private async _getParamsSnapshot(): Promise<NodeParam[]> {
    const allParams = await this._paramsService.filterParams();
    return allParams.map(({ node, param }) => ({ node, param }));
  }
}
