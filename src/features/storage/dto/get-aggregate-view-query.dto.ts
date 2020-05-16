import { IsNumber, IsEnum, IsOptional, IsArray, IsString, IsPositive } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AggregateViewGrouping, AggregateViewValue } from 'src/shared/services/database/type';

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
