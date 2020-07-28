import { DefinitionQueryResult } from '../type';

export class DefinitionQueryResultDto<T> {
  key: string;
  definition: string;
  ts: number;
  toModel(): DefinitionQueryResult<T> {
    return {
      key: this.key,
      definition: JSON.parse(this.definition) as T,
      updatedAt: Math.round(this.ts) * 1000,
    };
  }
}
