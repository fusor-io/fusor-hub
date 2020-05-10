import { Controller, Get, Query, Headers, Param } from '@nestjs/common';
import { StorageService } from '../../service/storage.service';
import { GetAggregateViewQueryDto } from '../../dto/get-aggregate-view-query.dto';

@Controller('aggregate')
export class AggregateController {
  constructor(private readonly _storageService: StorageService) {}

  @Get('batch')
  async getParamBatch(@Query() query, @Headers('accept') accept: string) {
    const results = await this._storageService.getBatch(Object.keys(query));
    if (accept === 'text/html') {
      return this._storageService.flatten(results);
    }
    return results;
  }

  @Get()
  async getParamView(@Query() query: GetAggregateViewQueryDto) {
    console.log(query);
    return this._storageService.getAggregateView(query.node, query.param);
  }

  @Get('dump')
  async dump() {
    await this._storageService.dump();
  }
}
