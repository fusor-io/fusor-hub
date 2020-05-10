import { IsNumber, IsEnum, IsOptional, IsArray, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AggregateViewGrouping } from '../type';
import { AggregateViewValue } from '../type/aggregate-view-value.type';

export class GetAggregateViewQueryDto {
  @IsString()
  node: string;

  @IsString()
  param: string;

  @IsEnum(AggregateViewGrouping)
  groupBy: AggregateViewGrouping;

  @IsNumber()
  @Type(() => String)
  @Transform((value: string) => parseInt(value))
  start: number; // unix timestamp (GMT 0)

  @IsOptional()
  @IsNumber()
  @Type(() => String)
  @Transform((value: string) => parseInt(value))
  end?: number; // if no end specified, current time is used for window end

  @IsOptional()
  @IsArray()
  @IsEnum(AggregateViewValue, { each: true })
  @Type(() => String)
  @Transform((value: string) => value.split(','))
  aggregates: AggregateViewValue[];
}
