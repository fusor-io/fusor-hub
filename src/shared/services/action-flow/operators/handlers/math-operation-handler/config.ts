export interface MathOperationHandlerConfig {
  expression: string;
}

export function isMathOperationHandlerConfig(config: any): config is MathOperationHandlerConfig {
  return 'expression' in config;
}
