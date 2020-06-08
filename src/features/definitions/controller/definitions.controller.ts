import { Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import * as MessagePack from 'msgpack-lite';
import { Controller, Put, Param, Body, Get, Headers, Res } from '@nestjs/common';

import { DefinitionsService } from '../../../shared/services/definitions/service/definitions.service';
import { SingleDefinitionParamsDto } from '../dto';
import { dateFromHttpFormat, dateToHttpFormat } from 'src/shared/utils';

@Controller('definitions')
export class DefinitionsController {
  constructor(private readonly _definitionsService: DefinitionsService) {}

  @Put(':nodeId')
  putDefinition(@Param() param: SingleDefinitionParamsDto, @Body() body) {
    return this._definitionsService.saveDefinition(param.nodeId, body);
  }

  @Get(':nodeId')
  async getDefinition(
    @Headers('accept') accept: string,
    @Headers('if-modified-since') ifModifiedSince: string,
    @Param() param: SingleDefinitionParamsDto,
    @Res() response: Response,
  ) {
    const result = await this._definitionsService.readDefinition(param.nodeId);

    if (!result) {
      return response.sendStatus(HttpStatus.NOT_FOUND);
    }

    if (ifModifiedSince) {
      const since = dateFromHttpFormat(ifModifiedSince);
      if (since >= result.updatedAt) return response.sendStatus(HttpStatus.NOT_MODIFIED);
    }

    response.setHeader('Last-Modified', dateToHttpFormat(result.updatedAt));

    switch (accept) {
      case 'application/msgpack':
        response.setHeader('Content-type', accept);
        return response.send(MessagePack.encode(result.definition));
      default:
        return response.send(result.definition);
    }
  }
}
