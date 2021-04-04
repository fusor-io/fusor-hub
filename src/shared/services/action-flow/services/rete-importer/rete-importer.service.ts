import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { DefinitionsService, DefinitionType } from '../../../definitions';
import {
  isMathOperationHandleConfig,
  isParamEmitterConfig,
  LogWriterOperator,
  MathOperationHandler,
  ObserverBase,
  Operator,
  ParamEmitterOperator,
} from '../../operators';
import { EventObservable, isEventEmitter, isEventObserver } from '../action-flow';
import { ReteDocument } from './type';
import { BuildQueue } from './type/build.type';
import { ReteInputConnection, ReteNode } from './type/rete.model';

export interface OperatorManifest {
  Class: { new (ref: ModuleRef): Operator };
  configGuard?: (config: any) => boolean;
}

const REGISTER: Record<string, OperatorManifest> = {
  ActionLog: { Class: LogWriterOperator },
  HandlerMath: { Class: MathOperationHandler, configGuard: isMathOperationHandleConfig },
  EmitParameter: { Class: ParamEmitterOperator, configGuard: isParamEmitterConfig },
};

@Injectable()
export class ReteImporterService {
  private _operators: Record<string, Operator>;
  private _buildQueue: BuildQueue;

  constructor(
    private readonly _moduleRef: ModuleRef,
    private readonly _definitionsService: DefinitionsService,
  ) {}

  async import(definitionId: string): Promise<boolean> {
    const definition = await this._definitionsService.readDefinition<ReteDocument>(
      DefinitionType.flow,
      definitionId,
    );
    if (!definition?.definition) return false;

    const reteDefinition = definition.definition;
    return this.buildFlow(reteDefinition);
  }

  buildFlow(rete: ReteDocument): boolean {
    const nodes = rete.nodes;
    const keys = Object.keys(nodes);
    this._buildQueue = keys.map(key => ({
      node: nodes[key],
      operator: undefined,
    }));
    this._operators = {};

    let nodeCount = keys.length;
    let hasUpdates = false;

    do {
      this.instantiate();
      hasUpdates = this._buildQueue.length < nodeCount;
      nodeCount = this._buildQueue.length;
    } while (hasUpdates && nodeCount > 0);

    return nodeCount === 0;
  }

  instantiate(): void {
    this._buildQueue = this._buildQueue.filter(node => {
      const operator = this.instantiateOperator(node.node);

      if (operator === undefined) {
        // unable instantiate, leave for the next cycle
        return true;
      } else {
        this._operators[node.node.id] = operator;
        // instantiated successfully, remove from queue
        return false;
      }
    });
  }

  instantiateOperator(node: ReteNode): Operator | undefined {
    // validate that all (if any) inputs has outputs ready from already instantiated operators
    if (!this._allInputsAvailable(node)) return undefined;

    const manifest = REGISTER[node.name];
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

  newOperator(manifest: OperatorManifest): Operator {
    return new manifest.Class(this._moduleRef);
  }

  /**
   * Take ReteNode and check if we have all Operators ready
   * to provide outputs for ReteNode inputs.
   * @param node
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

    const operator = this._operators[sourceNodeId];
    return operator && isEventEmitter(operator) && operator.outputs[sourceOutputName];
  }
}
