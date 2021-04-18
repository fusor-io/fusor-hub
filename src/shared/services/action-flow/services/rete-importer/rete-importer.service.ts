import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as slug from 'slug';
import { inspect } from 'util';

import { CronService } from '../../../cron';
import { DefinitionsService, DefinitionType } from '../../../definitions';
import { ParamsService } from '../../../params';
import {
  ChangeCountHandlerOperator,
  DistinctHandlerOperator,
  FlowSet,
  FlowSets,
  GateHandlerOperator,
  isMathOperationHandlerConfig,
  isParamEmitterConfig,
  isSmsSenderConfig,
  isThrottleHandlerConfig,
  LogWriterOperator,
  MathOperationHandler,
  ObserverBase,
  Operator,
  ParamEmitterOperator,
  SmsSenderOperator,
  ThrottleHandlerOperator,
} from '../../operators';
import { EventObservable, isEventEmitter, isEventObserver } from '../action-flow';
import { BuildQueue, OperatorManifest, ReteDocument, ReteInputConnection, ReteNode } from './type';

const REGISTRY: Record<string, OperatorManifest> = {
  'emitter-param': { Class: ParamEmitterOperator, configGuard: isParamEmitterConfig },
  'handler-math': { Class: MathOperationHandler, configGuard: isMathOperationHandlerConfig },
  'handler-gate': { Class: GateHandlerOperator },
  'handler-change-count': { Class: ChangeCountHandlerOperator },
  'handler-distinct': { Class: DistinctHandlerOperator },
  'handler-throttle': { Class: ThrottleHandlerOperator, configGuard: isThrottleHandlerConfig },
  'observer-logger': { Class: LogWriterOperator },
  'observer-sms': { Class: SmsSenderOperator, configGuard: isSmsSenderConfig },
};

@Injectable()
export class ReteImporterService {
  private readonly _logger = new Logger(this.constructor.name);

  private _lastDefinitions = '';
  private _flows: FlowSets = [];
  private _flowSet: FlowSet;
  private _builtQueue: BuildQueue;

  constructor(
    private readonly _moduleRef: ModuleRef,
    private readonly _definitionsService: DefinitionsService,
    private readonly _cronService: CronService,
    private readonly _paramsService: ParamsService,
  ) {}

  async schedule(): Promise<void> {
    this._logger.log(`Scheduling flow import`);
    await this.import();
    this._cronService.schedule(this, 'rete', '*/5 * * * *', () => this.import());
  }

  /**
   * Import all flow definitions. Can be called safely many times, to re-import them.
   * After the import add successfully imported flows are active instantly.
   */
  async import(): Promise<void> {
    try {
      this._logger.log('Importing flows');

      const definitions = await this._definitionsService.readDefinitions<ReteDocument>(
        DefinitionType.flow,
      );

      // check if we need reimport
      const definitionsJson = JSON.stringify(definitions);
      if (this._lastDefinitions === definitionsJson) {
        this._logger.log('No updates, skipping...');
        return;
      }
      this._lastDefinitions = definitionsJson;

      // release resources on each run, so that we can re-import on a regular base
      this._destroy();

      let count = 0;

      for (const definition of definitions || []) {
        if (!definition?.definition) continue;
        const reteDefinition = definition.definition;

        if (this.buildFlow(reteDefinition)) {
          this._flows.push(this._flowSet);
          this._logger.log(`Flow definition ${definition.key} loaded`);
          count++;
        } else {
          Object.keys(this._flowSet).forEach(key => this._flowSet[key].destroy());
          this._logger.warn(`Flow definition ${definition.key} failed to load, skipping...`);
        }
      }

      this._flowSet = undefined;

      await this._paramsService.emitCurrentValues();

      this._logger.log(`Imported ${count} flows`);
    } catch (error) {
      this._logger.error(`Import failed: ${inspect(error)}`);
    }
  }

  /**
   * Take Rete document and build flow based on it
   */
  buildFlow(rete: ReteDocument): boolean {
    const nodes = rete.nodes;
    const keys = Object.keys(nodes);

    // Build the queue of operators to be instantiated
    this._builtQueue = keys.map(key => ({
      node: nodes[key],
      operator: undefined,
    }));
    this._flowSet = {};

    let nodeCount = keys.length;
    let hasUpdates = false;

    // Some operators may miss inputs be ready at this time
    // We iterate many times to assure all inputs are ready
    do {
      this.instantiate();
      hasUpdates = this._builtQueue.length < nodeCount;
      nodeCount = this._builtQueue.length;
    } while (hasUpdates && nodeCount > 0);

    return nodeCount === 0;
  }

  /**
   * Instantiate operators satisfying their input requirements
   */
  instantiate(): void {
    this._builtQueue = this._builtQueue.filter(node => {
      const operator = this.instantiateOperator(node.node);

      if (operator === undefined) {
        // unable instantiate, leave for the next cycle
        return true;
      } else {
        this._flowSet[node.node.id] = operator;
        // instantiated successfully, remove from queue
        return false;
      }
    });
  }

  /**
   * Instantiate single operator if all inputs are already ready
   */
  instantiateOperator(node: ReteNode): Operator | undefined {
    // validate that all (if any) inputs has outputs ready from already instantiated operators
    if (!this._allInputsAvailable(node)) return undefined;

    const manifest = REGISTRY[slug(node.name)];
    if (!manifest) return undefined;
    if (manifest.configGuard && !manifest.configGuard(node.data)) return undefined;

    const operator = this.newOperator(manifest);
    operator.init(node.data);

    if (this._attachInputs(operator, node)) {
      if (isEventObserver(operator)) {
        if (operator.engage()) return operator;
      } else {
        return operator;
      }
    }

    operator.destroy();
    return undefined;
  }

  /**
   * Create new operator instance
   */
  newOperator(manifest: OperatorManifest): Operator {
    return new manifest.Class(this._moduleRef);
  }

  /**
   * Take ReteNode and check if we have all Operators ready
   * to provide outputs for ReteNode inputs.
   */
  private _allInputsAvailable(node: ReteNode): boolean {
    const inputs = node.inputs;
    return Object.keys(inputs).every(key => {
      const connections = inputs[key]?.connections;
      if (!connections || !connections.length) return true;
      return !!this._getConnectionObservable(connections[0]);
    });
  }

  /**
   * Attach all inputs. Return false in not all available
   */
  private _attachInputs(operator: Operator, node: ReteNode): boolean {
    if (!(operator instanceof ObserverBase)) return true;

    const observables = this._getRequiredObservables(operator, node);
    if (!observables) return false;

    Object.keys(observables).forEach(key => operator.attachInput(key, observables[key]));

    return operator.isFullyWired;
  }

  /**
   * Check if Operator requirements and return all required inputs
   * If not all inputs are already ready, return undefined
   */
  private _getRequiredObservables(
    operator: Operator,
    node: ReteNode,
  ): Record<string, EventObservable> | undefined {
    const results: Record<string, EventObservable> = {};

    if (isEventObserver(operator)) {
      for (const inputName of operator.expectedInputs) {
        const observable = this._getInputObservable(node, inputName);
        if (!observable) return undefined;
        results[inputName] = observable;
      }
    }

    return results;
  }

  /**
   * Check if specific input has emitter ready and return observable
   */
  private _getInputObservable(node: ReteNode, inputName: string): EventObservable {
    const connection = node?.inputs?.[inputName]?.connections?.[0];
    return connection && this._getConnectionObservable(connection);
  }

  /**
   * Check if connection is well defined, has emitter ready and return observable
   */
  private _getConnectionObservable(connection: ReteInputConnection): EventObservable {
    const sourceNodeId = connection?.node?.toString();
    const sourceOutputName = connection?.output;

    // validate input definition
    if (!sourceNodeId || !sourceOutputName) return undefined;

    const operator = this._flowSet[sourceNodeId];
    return operator && isEventEmitter(operator) && operator.outputs[sourceOutputName];
  }

  /**
   * Destroy operators of provided flow
   */
  private _destroyFlow(flowSet: FlowSet): void {
    // Destroying operator unsubscribes subscriptions and releases any other resources
    Object.keys(flowSet).forEach(key => this._flowSet[key].destroy());
  }

  /**
   * Destroy all flows
   */
  private _destroy(): void {
    for (const flowSet of this._flows) this._destroyFlow(flowSet);
    this._flows = [];
    this._flowSet = undefined;
  }
}
