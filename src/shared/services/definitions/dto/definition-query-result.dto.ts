import { DefinitionQueryResult } from '../type';

export class DefinitionQueryResultDto {
  node: string;
  definition: string;
  ts: number;
  toModel(): DefinitionQueryResult {
    return {
      node: this.node,
      definition: JSON.parse(this.definition),
      updatedAt: Math.round(this.ts) * 1000,
    };
  }
}
