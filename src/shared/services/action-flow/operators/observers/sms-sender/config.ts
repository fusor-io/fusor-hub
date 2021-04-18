export interface SmsSenderConfig {
  recipient: string;
  text: string;
}

export function isSmsSenderConfig(config: any): config is SmsSenderConfig {
  return 'recipient' in config && 'text' in config;
}
