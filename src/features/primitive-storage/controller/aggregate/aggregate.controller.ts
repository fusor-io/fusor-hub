import { Controller, Get, Query, Headers, Param, Res } from '@nestjs/common';
import * as MessagePack from 'msgpack-lite';
import { StorageService } from '../../service/storage.service';
import { GetAggregateViewQueryDto } from '../../dto/get-aggregate-view-query.dto';
import { GetParamParamsDto, GetFilterQueryDto, GetFilterQueryResult } from '../../dto';
import { Response } from 'express';

@Controller('aggregate')
export class AggregateController {
  constructor(private readonly _storageService: StorageService) {}

  @Get('batch')
  async getParamBatch(
    @Headers('accept') accept: string,
    @Query() query,
    @Res() response: Response,
  ) {
    const results = await this._storageService.getBatch(Object.keys(query));
    switch (accept) {
      case 'text/html':
        return response.send(this._storageService.flattenObject(results));
      case 'application/msgpack':
        response.setHeader('Content-type', accept);
        return response.send(MessagePack.encode(results));
      default:
        return response.send(results);
    }
  }

  @Get('filter')
  async filterParams(@Query() query: GetFilterQueryDto): Promise<GetFilterQueryResult> {
    return this._storageService.filter(query.nodeId, query.paramId, query.flat || false);
  }

  @Get(':nodeId/:paramId')
  async getParamView(
    @Headers('accept') accept: string,
    @Param() params: GetParamParamsDto,
    @Query() query: GetAggregateViewQueryDto,
    @Res() response: Response,
  ) {
    const results = await this._storageService.getAggregateView(
      params.nodeId,
      params.paramId,
      query,
    );
    switch (accept) {
      case 'application/msgpack':
        response.setHeader('Content-type', accept);
        return response.send(MessagePack.encode(results));
      default:
        return response.send(results);
    }
  }

  @Get('dump')
  async dump() {
    await this._storageService.dump();
  }
}
