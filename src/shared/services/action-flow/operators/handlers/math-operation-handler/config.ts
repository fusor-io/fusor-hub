export interface MathOperationHandleConfig {
  expression: string;
}

export function isMathOperationHandlerConfig(config: any): config is MathOperationHandleConfig {
  return 'expression' in config;
}
