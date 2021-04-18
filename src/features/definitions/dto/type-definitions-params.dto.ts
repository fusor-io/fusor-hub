import { IsString, Length } from 'class-validator';

import { LIMIT_MAX_DEFINITION_TYPE_LENGTH } from '../../../shared/const';

export class TypeDefinitionsParamsDto {
  @IsString()
  @Length(1, LIMIT_MAX_DEFINITION_TYPE_LENGTH)
  type: string;
}
