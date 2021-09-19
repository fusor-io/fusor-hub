import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';

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
}
