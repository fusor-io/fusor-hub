import { Type, Transform } from 'class-transformer';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class GetFilterQueryDto {
  @IsOptional()
  @IsString()
  nodeId?: string;

  @IsOptional()
  @IsString()
  paramId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => String)
  @Transform((value: string) => value.toLowerCase() === 'true' || value === '1')
  flat?: boolean;
}
