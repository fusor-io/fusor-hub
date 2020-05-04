import { Controller, Body, Post, Param } from '@nestjs/common';
import { PostBatchPayloadDto, PostSensorParamsDto, PostBatchParamsDto } from '../dto';
import { StorageService } from '../service/storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly _storageService: StorageService) {}

  @Post(':nodeId/batch')
  batchPost(@Body() body: PostBatchPayloadDto, @Param() params: PostBatchParamsDto) {
    this._storageService.postBatch(params.nodeId, body);
  }

  @Post(':nodeId/:sensorId/:value')
  async post(@Param() params: PostSensorParamsDto) {
    const { nodeId, sensorId, value } = params;
    // TODO change Int to Float
    this._storageService.saveSensorReading(nodeId, sensorId, parseInt(value));
  }
}
