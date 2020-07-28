export interface DefinitionQueryResult<T = object> {
  key?: string;
  definition: T;
  updatedAt: number;
}
