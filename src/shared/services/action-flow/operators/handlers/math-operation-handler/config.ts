export interface MathOperationHandleConfig {
  expression: string;
}

export function isMathOperationHandleConfig(config: any): config is MathOperationHandleConfig {
  return 'expression' in config;
}
