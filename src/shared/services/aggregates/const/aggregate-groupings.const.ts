import { AggregateViewGrouping } from '../type';

export const MINUTE_PRECISION_GROUPINGS = [
  AggregateViewGrouping.by1Minute,
  AggregateViewGrouping.by15Minutes,
  AggregateViewGrouping.by30Minutes,
  AggregateViewGrouping.by1Hour,
  AggregateViewGrouping.by2Hours,
  AggregateViewGrouping.by3Hours,
  AggregateViewGrouping.by6Hours,
  AggregateViewGrouping.by12Hours,
  AggregateViewGrouping.by1Day,
  AggregateViewGrouping.by1Week,
];

export const MONTH_PRECISION_GROUPINGS = [
  AggregateViewGrouping.by1Month,
  AggregateViewGrouping.by3Months,
  AggregateViewGrouping.by6Months,
];

export const YEAR_PRECISION_GROUPINGS = [AggregateViewGrouping.by1Year];
