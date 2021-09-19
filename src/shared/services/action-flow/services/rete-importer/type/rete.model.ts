export interface ReteDocument {
  id: string;
  nodes: Record<string, ReteNode>;
}

export interface ReteNode<T = any> {
  name: string;
  id: number;
  data: T;
  inputs: Record<string, ReteInput>;
  outputs: Record<string, ReteOutput>;
  position: [number, number];
}

export interface ReteInput {
  connections: ReteInputConnection[];
}

export interface ReteOutput {
  connections: ReteOutputConnection[];
}

export interface ReteInputConnection<T = any> {
  node: number;
  output: string;
  data: T;
}

export interface ReteOutputConnection<T = any> {
  node: number;
  input: string;
  data: T;
}
