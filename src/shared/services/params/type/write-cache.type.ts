export interface WriteCacheEntry {
  nodeId: string;
  paramId: string;
  value: number;
  lastWriteTime: number;
  isFlushed: boolean;
}

export interface WriteCache {
  [key: string]: WriteCacheEntry;
}
