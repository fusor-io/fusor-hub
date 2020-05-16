import { Length, IsString } from 'class-validator';
import { LIMIT_MAX_NODE_ID_LENGTH, LIMIT_MAX_PARAM_ID_LENGTH } from 'src/shared/const';

export class GetParamParamsDto {
  @IsString()
  @Length(1, LIMIT_MAX_NODE_ID_LENGTH)
  nodeId: string;

  @IsString()
  @Length(1, LIMIT_MAX_PARAM_ID_LENGTH)
  paramId: string;
}
