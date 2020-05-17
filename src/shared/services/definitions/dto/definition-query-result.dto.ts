import { DefinitionQueryResult } from '../type';

export class DefinitionQueryResultDto {
  definition: string;
  ts: number;
  toModel(): DefinitionQueryResult {
    return {
      definition: JSON.parse(this.definition),
      updatedAt: Math.round(this.ts) * 1000,
    };
  }
}
