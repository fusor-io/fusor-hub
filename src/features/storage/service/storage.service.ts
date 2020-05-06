import { Injectable, Logger } from '@nestjs/common';
import { PostBatchPayloadDto, SensorDataPayload } from '../dto/post-batch-payload.dto';
import { DatabaseService } from 'src/shared/services/database/service/database.service';
import { inspect } from 'util';

@Injectable()
export class StorageService {
  private readonly _logger = new Logger(this.constructor.name);

  constructor(private readonly _databaseService: DatabaseService) {}

  public async saveSensorReading(nodeId: string, sensorId: string, value: number): Promise<void> {
    try {
      await this._databaseService.writeValue(nodeId, sensorId, value);
    } catch (error) {
      this._logger.error(`Failed storing ${sensorId}`, error?.message);
    }
  }

  public async getParam(nodeId: string, paramId: string): Promise<string> {
    try {
      const value = await this._databaseService.readParam(nodeId, paramId);
      return value === undefined ? '' : value.toString();
    } catch (error) {
      this._logger.error(`Failed reading param ${nodeId}:${paramId}`, error?.message);
      return '';
    }
  }

  public async saveParam(nodeId: string, paramId: string, value: number): Promise<void> {
    try {
      await this._databaseService.writeParam(nodeId, paramId, value);
    } catch (error) {
      this._logger.error(`Failed storing ${paramId}`, error?.message);
    }
  }

  async postBatch(nodeId: string, payload: PostBatchPayloadDto): Promise<void> {
    try {
      if (payload) {
        await Promise.all([
          this._saveReadingsBatch(nodeId, { ...payload.r, ...payload.readings }),
          this._saveParamsBatch(nodeId, { ...payload.p, ...payload.params }),
        ]);
      }
    } catch (error) {
      this._logger.error(
        `Failed posting batch for node: ${nodeId}, payload: ${inspect(payload)}`,
        error?.message,
      );
    }
  }

  private async _saveReadingsBatch(nodeId: string, payload: SensorDataPayload): Promise<void> {
    if (payload && Object.keys(payload).length) {
      await Promise.all(
        Object.keys(payload).map(sensorId =>
          this.saveSensorReading(nodeId, sensorId, payload[sensorId]),
        ),
      );
    }
  }

  private async _saveParamsBatch(nodeId: string, payload: SensorDataPayload): Promise<void> {
    if (payload && Object.keys(payload).length) {
      await Promise.all(
        Object.keys(payload).map(sensorId => this.saveParam(nodeId, sensorId, payload[sensorId])),
      );
    }
  }
}
