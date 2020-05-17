import { IsString, Length } from 'class-validator';
import { LIMIT_MAX_NODE_ID_LENGTH } from 'src/shared/const';

export class SingleDefinitionParamsDto {
  @IsString()
  @Length(1, LIMIT_MAX_NODE_ID_LENGTH)
  nodeId: string;
}
