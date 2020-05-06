import { Controller, Body, Post, Param, Get, Put } from '@nestjs/common';
import {
  PostBatchPayloadDto,
  PostSensorParamsDto,
  PostBatchParamsDto,
  GetParamParamsDto,
  PutParamParamsDto,
} from '../dto';
import { StorageService } from '../service/storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly _storageService: StorageService) {}

  @Post('node/:nodeId/batch')
  postBatch(@Body() body: PostBatchPayloadDto, @Param() params: PostBatchParamsDto) {
    this._storageService.postBatch(params.nodeId, body);
  }

  @Post('node/:nodeId/sensor/:sensorId/:value')
  postSensorValue(@Param() params: PostSensorParamsDto) {
    const { nodeId, sensorId, value } = params;
    this._storageService.saveSensorReading(nodeId, sensorId, parseFloat(value));
  }

  @Put('node/:nodeId/param/:paramId/:value')
  putParamValue(@Param() params: PutParamParamsDto) {
    const { nodeId, paramId: paramId, value } = params;
    this._storageService.saveParam(nodeId, paramId, parseFloat(value));
  }

  @Get('node/:nodeId/param/:paramId')
  async getParam(@Param() params: GetParamParamsDto) {
    const { nodeId, paramId } = params;
    return this._storageService.getParam(nodeId, paramId);
  }
}
