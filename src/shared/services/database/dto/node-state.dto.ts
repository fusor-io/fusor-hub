import { NodeParam } from '../type';

export class NodeParamsDto {
  [paramId: string]: {
    v: number;
    d: number;
  };

  constructor(params: NodeParam[]) {
    params.forEach(param => {
      this[param.param] = {
        v: param.value,
        d: param.ts,
      };
    });
  }
}

export class NodeStateDto {
  // r - latest readings from node sensors
  // p - node params
  constructor(public p?: NodeParamsDto) {}
}
