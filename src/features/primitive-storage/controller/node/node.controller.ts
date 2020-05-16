import { Controller, Body, Post, Param, Get, Put } from '@nestjs/common';
import {
  PostBatchParamsDto,
  GetParamParamsDto,
  PutParamParamsDto,
  ParamsPayloadDto,
} from '../../dto';
import { StorageService } from '../../service/storage.service';

@Controller('node')
export class NodeController {
  constructor(private readonly _storageService: StorageService) {}

  @Post(':nodeId/batch')
  postBatch(@Body() body: ParamsPayloadDto, @Param() params: PostBatchParamsDto) {
    this._storageService.saveBatch(params.nodeId, body);
  }

  @Put(':nodeId/:paramId/:value')
  putParam(@Param() params: PutParamParamsDto) {
    const { nodeId, paramId: paramId, value } = params;
    this._storageService.saveParam(nodeId, paramId, parseFloat(value));
  }

  @Get(':nodeId/:paramId')
  async getParam(@Param() params: GetParamParamsDto) {
    const { nodeId, paramId } = params;
    const value = await this._storageService.getParam(nodeId, paramId);
    return value === undefined ? '' : value.toString();
  }
}
