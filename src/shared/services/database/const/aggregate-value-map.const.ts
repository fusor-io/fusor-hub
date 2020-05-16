import { AggregateViewValue } from '../type';

export const AGGREGATE_VALUE_MAP = {
  [AggregateViewValue.average]: 'AVG(value) as avg',
  [AggregateViewValue.max]: 'MAX(value) as max',
  [AggregateViewValue.min]: 'MIN(value) as min',
};
