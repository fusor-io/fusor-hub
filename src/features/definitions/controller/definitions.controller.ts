import { Body, Controller, Get, Headers, Param, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import * as MessagePack from 'msgpack-lite';
import { DefinitionQueryResult } from 'src/shared/services/definitions/type';
import { dateFromHttpFormat, dateToHttpFormat } from 'src/shared/utils';

import { DefinitionsService } from '../../../shared/services/definitions/service/definitions.service';
import { SingleDefinitionParamsDto, TypeDefinitionsParamsDto } from '../dto';

@Controller('definitions')
export class DefinitionsController {
  constructor(private readonly _definitionsService: DefinitionsService) {}

  @Put(':type/:key')
  putNodeDefinition(@Param() param: SingleDefinitionParamsDto, @Body() body) {
    return this._definitionsService.saveDefinition(param.type, param.key, body);
  }

  @Get(':type')
  async getDefinitions(@Param() param: TypeDefinitionsParamsDto): Promise<DefinitionQueryResult[]> {
    return this._definitionsService.readDefinitions(param.type);
  }

  @Get(':type/:key')
  async getDefinition(
    @Headers('accept') accept: string,
    @Headers('if-modified-since') ifModifiedSince: string,
    @Param() param: SingleDefinitionParamsDto,
    @Res() response: Response,
  ) {
    const result = await this._definitionsService.readDefinition(param.type, param.key);

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
