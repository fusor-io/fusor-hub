export interface SensorDataPostPayload {
  [sensorId: string]: number;
}

/**
 * Sensor can provide us with:
 *  value - reading of the sensor. We want history for value change in time.
 *  params - some state values. We want to store only the last value of each param.
 */

export interface NodePostPayload {
  readings?: SensorDataPostPayload;
  r?: SensorDataPostPayload; // alias for `readings` - if we want to post short packets
  params?: SensorDataPostPayload;
  p?: SensorDataPostPayload; // alias for `params` - if we want to post short packets
}
