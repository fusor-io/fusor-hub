export interface ThrottleHandleConfig {
  duration: number;
}

export function isThrottleHandlerConfig(config: any): config is ThrottleHandleConfig {
  return 'duration' in config;
}
