import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Expression, Parser, Value } from 'expr-eval';
import { map } from 'rxjs/operators';
import { inspect } from 'util';

import { EventObservable, FlowEventType } from '../../../services/action-flow';
import { HandlerBase } from '../../handler-base';
import { MathOperationHandlerConfig } from './config';
import { INPUT_NAMES, OUTPUT_OUT } from './const';



export class MathOperationHandler extends HandlerBase<MathOperationHandlerConfig> {
  private readonly _logger = new Logger(this.constructor.name);
  readonly inputs: Record<'in1' | 'in2', EventObservable>;

  private _expression: Expression;

  constructor(moduleRef: ModuleRef) {
    super(moduleRef, INPUT_NAMES);
  }

  init(config: MathOperationHandlerConfig) {
    const parser = new Parser();
    this._expression = parser.parse(config.expression);
  }

  engage(): boolean {
    if (!this.isFullyWired) return false;

    this.outputs[OUTPUT_OUT] = this._combineInputs().pipe(
      map((inputs: Record<'in1' | 'in2', FlowEventType>) => ({
        in1: +inputs.in1 || 0,
        in2: +inputs.in2 || 0,
      })),
      map(inputs => ({ value: this._eval(inputs) })),
    );

    return true;
  }

  private _eval(inputs: Value): FlowEventType {
    try {
      const result = this._expression.evaluate(inputs);
      return ['boolean', 'number'].includes(typeof result) ? result : undefined;
    } catch (error) {
      this._logger.error(`Failed math evaluation: ${inspect(error)}`);
      return undefined;
    }
  }
}
