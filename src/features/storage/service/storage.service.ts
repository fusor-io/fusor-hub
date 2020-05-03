import { Injectable, Logger } from '@nestjs/common';
import { NodePostPayload, SensorDataPostPayload } from '../dto/node.dto';
import { MysqlService } from 'src/shared/services/mysql/service/mysql.service';

@Injectable()
export class StorageService {
  private readonly _logger = new Logger(this.constructor.name);

  constructor(private readonly _mySqlService: MysqlService) {}

  private async _saveSensorReading(sensorId: string, value: number): Promise<void> {
    try {
      await this._mySqlService.writeValue(sensorId, value);
    } catch (error) {
      this._logger.error(`Failed storing ${sensorId}`, error?.message);
    }
  }

  private async _saveParam(nodeId: string, paramId: string, value: number): Promise<void> {
    try {
      await this._mySqlService.writeParam(nodeId, paramId, value);
    } catch (error) {
      this._logger.error(`Failed storing ${paramId}`, error?.message);
    }
  }

  private async _saveReadings(payload: SensorDataPostPayload): Promise<void> {
    if (payload && Object.keys(payload).length) {
      await Promise.all(
        Object.keys(payload).map(sensorId => this._saveSensorReading(sensorId, payload[sensorId])),
      );
    }
  }

  private async _saveParams(nodeId: string, payload: SensorDataPostPayload): Promise<void> {
    if (payload && Object.keys(payload).length) {
      await Promise.all(
        Object.keys(payload).map(sensorId => this._saveParam(nodeId, sensorId, payload[sensorId])),
      );
    }
  }

  async _post(nodeId: string, payload: NodePostPayload): Promise<void> {
    if (payload) {
      await Promise.all([
        this._saveReadings({ ...payload.r, ...payload.readings }),
        this._saveParams(nodeId, { ...payload.p, ...payload.params }),
      ]);
    }
  }
}
