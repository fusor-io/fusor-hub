import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsPositive, Max, Min, ValidateIf } from 'class-validator';

import { MAX_AGGREGATE_VALUE_COUNT } from '../../../shared/const';
import { AggregateViewGrouping, AggregateViewValue } from '../../../shared/services/aggregates';

export class GetAggregateViewQueryDto {
  @IsEnum(AggregateViewGrouping)
  groupBy: AggregateViewGrouping;

  @IsNumber()
  @IsPositive()
  @Type(() => String)
  @Transform((value: string) => parseInt(value))
  start: number; // unix timestamp (GMT 0)

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => String)
  @Transform((value: string) => parseInt(value))
  end?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(AggregateViewValue, { each: true })
  @Type(() => String)
  @Transform((value: string) => value.split(','))
  aggregates: AggregateViewValue[];

  @IsOptional()
  @ValidateIf(value => value !== undefined)
  @IsNumber()
  @Min(1)
  @Max(MAX_AGGREGATE_VALUE_COUNT)
  @Type(() => String)
  @Transform((value: string) => parseInt(value))
  limit?: number;
}
