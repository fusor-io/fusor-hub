import { Length, IsNumberString } from 'class-validator';
import { LIMIT_MAX_NODE_ID_LENGTH, LIMIT_MAX_PARAM_ID_LENGTH } from 'src/shared/const';

export class PutParamParamsDto {
  @Length(1, LIMIT_MAX_NODE_ID_LENGTH)
  nodeId: string;

  @Length(1, LIMIT_MAX_PARAM_ID_LENGTH)
  paramId: string;

  @IsNumberString()
  value: string;
}
