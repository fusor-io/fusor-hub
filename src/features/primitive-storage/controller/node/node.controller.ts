import { Body, Controller, Get, Headers, Param, Post, Put } from '@nestjs/common';

import { GetParamParamsDto, ParamsPayloadDto, PostBatchParamsDto, PutParamParamsDto } from '../../dto';
import { StorageService } from '../../service/storage.service';
import { CacheControl } from '../../type';

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
    this._storageService.saveParam(nodeId, paramId, value);
  }

  @Get(':nodeId/:paramId')
  async getParam(
    @Param() params: GetParamParamsDto,
    @Headers('Cache-Control') cacheControl: CacheControl,
  ): Promise<string> {
    const { nodeId, paramId } = params;
    const value = await this._storageService.getParam(
      nodeId,
      paramId,
      cacheControl !== CacheControl.noCache,
    );
    return value === undefined || value === null ? '' : value.toString();
  }
}
