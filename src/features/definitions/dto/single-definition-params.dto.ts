import { IsString, Length } from 'class-validator';
import { LIMIT_MAX_NODE_ID_LENGTH, LIMIT_MAX_DEFINITION_TYPE_LENGTH } from 'src/shared/const';

export class SingleDefinitionParamsDto {
  @IsString()
  @Length(1, LIMIT_MAX_DEFINITION_TYPE_LENGTH)
  type: string;

  @IsString()
  @Length(1, LIMIT_MAX_NODE_ID_LENGTH)
  nodeId: string;
}
