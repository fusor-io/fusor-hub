import { Response } from 'express';
import * as MessagePack from 'msgpack-lite';
import { Controller, Put, Param, Body, Get, Headers, Res } from '@nestjs/common';

import { DefinitionsService } from '../../../shared/services/definitions/service/definitions.service';
import { SingleDefinitionParamsDto } from '../dto';

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
    @Param() param: SingleDefinitionParamsDto,
    @Res() response: Response,
  ) {
    const definition = await this._definitionsService.readDefinition(param.nodeId);
    switch (accept) {
      case 'application/msgpack':
        response.setHeader('Content-type', accept);
        return response.send(MessagePack.encode(definition));
      default:
        return response.send(definition);
    }
  }
}
