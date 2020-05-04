import { IsOptional, ValidateNested } from 'class-validator';

export class SensorDataPayload {
  [sensorId: string]: number;
}

// export type SensorDataPostPayload = Map<string, number>;

/**
 * Sensor can provide us with:
 *  value - reading of the sensor. We want history for value change in time.
 *  params - some state values. We want to store only the last value of each param.
 */

export class PostBatchPayloadDto {
  @IsOptional()
  @ValidateNested()
  readings: SensorDataPayload;

  @IsOptional()
  @ValidateNested()
  r?: SensorDataPayload; // alias for `readings` - if we want to post short packets

  @IsOptional()
  @ValidateNested()
  params?: SensorDataPayload;

  @IsOptional()
  @ValidateNested()
  p?: SensorDataPayload; // alias for `params` - if we want to post short packets
}
