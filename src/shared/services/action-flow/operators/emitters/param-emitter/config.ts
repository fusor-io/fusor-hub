export interface ParamEmitterConfig {
  nodeId: string;
  paramId: string;
}

export function isParamEmitterConfig(config: any): config is ParamEmitterConfig {
  return 'nodeId' in config && 'paramId' in config;
}
