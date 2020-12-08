import { Controller, Get, Headers, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import * as MessagePack from 'msgpack-lite';

import { FilterResultTypes, GetFilterQueryDto, GetParamParamsDto } from '../../dto';
import { GetAggregateViewQueryDto } from '../../dto/get-aggregate-view-query.dto';
import { StorageService } from '../../service/storage.service';

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
        return response.send(this._storageService.convertToText(results));
      case 'application/msgpack':
        response.setHeader('Content-type', accept);
        return response.send(MessagePack.encode(results));
      default:
        return response.send(results);
    }
  }

  @Get('batch/flat')
  async getParamBatchFlat(
    @Headers('accept') accept: string,
    @Query() query,
    @Res() response: Response,
  ) {
    const results = await this._storageService.getBatch(Object.keys(query));
    const flatResults = this._storageService.flatten(results);
    switch (accept) {
      case 'text/html':
        return response.send(this._storageService.convertToText(flatResults));
      case 'application/msgpack':
        response.setHeader('Content-type', accept);
        return response.send(MessagePack.encode(flatResults));
      default:
        return response.send(flatResults);
    }
  }

  @Get('filter')
  async filterParams(@Query() query: GetFilterQueryDto, @Res() response: Response) {
    const results = await this._storageService.filter(
      query.nodeId,
      query.paramId,
      query.format || FilterResultTypes.default,
    );

    if (query.format === FilterResultTypes.odata) {
      response.setHeader('Content-type', 'application/json; odata.metadata=minimal');
      response.setHeader('OData-Version', '4.0');
      return response.send(results);
    } else {
      return response.send(results);
    }
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
}
