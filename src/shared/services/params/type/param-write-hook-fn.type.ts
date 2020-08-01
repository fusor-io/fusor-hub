export type ParamWriteHookFn = (nodeId: string, paramId: string, value: number) => Promise<void> | void;
