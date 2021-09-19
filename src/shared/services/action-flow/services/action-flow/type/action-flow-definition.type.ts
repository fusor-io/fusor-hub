export enum PredefinedOperatorType {
  math = 'math',
  pipe = 'pipe',
}

export enum PipeOperator {
  scheduler = 'scheduler',
  interval = 'interval',
  debounce = 'debounce',
  throttle = 'throttle',
  distinct = 'distinct',
}

export interface ActionActivator {
  actionId: string;
  options: Record<string, string | number | boolean>;
  input: OperatorDefinition;
}

export interface OperatorDefinition {
  operationId: string;
  inputs?: Record<string, InputDefinition>;
}

export interface PipeOperatorDefinition extends OperatorDefinition {
  operationId: PredefinedOperatorType.pipe;
  options: Record<string, number>;
  operator: PipeOperator;
}

export interface MathOperatorDefinitions extends OperatorDefinition {
  operationId: PredefinedOperatorType.math;
  expression: string;
}

export type InputDefinition = ParamInputDefinition | OperatorDefinition;

export interface ParamInputDefinition {
  nodeId: string;
  paramId: number;
}
