import { Length, IsNumberString } from 'class-validator';
import { LIMIT_MAX_NODE_ID_LENGTH, LIMIT_MAX_SENSOR_ID_LENGTH } from 'src/shared/const';

export class PostSensorParamsDto {
  @Length(1, LIMIT_MAX_NODE_ID_LENGTH)
  nodeId: string;

  @Length(1, LIMIT_MAX_SENSOR_ID_LENGTH)
  sensorId: string;

  @IsNumberString()
  value: string;
}
