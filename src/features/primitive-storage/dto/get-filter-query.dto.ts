import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum FilterResultTypes {
  default = 'default',
  flat = 'flat',
  odata = 'odata',
}

export class GetFilterQueryDto {
  @IsOptional()
  @IsString()
  nodeId?: string;

  @IsOptional()
  @IsString()
  paramId?: string;

  @IsOptional()
  @IsEnum(FilterResultTypes)
  format?: FilterResultTypes;
}
