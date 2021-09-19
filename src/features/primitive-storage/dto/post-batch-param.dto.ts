import { Length } from 'class-validator';

import { LIMIT_MAX_NODE_ID_LENGTH } from '../../../shared/const';

export class PostBatchParamsDto {
  @Length(1, LIMIT_MAX_NODE_ID_LENGTH)
  nodeId: string;
}
