import { Controller, Get, Query, Headers } from '@nestjs/common';
import { StorageService } from '../../service/storage.service';

@Controller('aggregate')
export class AggregateController {
  constructor(private readonly _storageService: StorageService) {}

  @Get()
  async getAggregate(@Query() query, @Headers('accept') accept: string) {
    const results = await this._storageService.getBatch(Object.keys(query));
    if (accept === 'text/html') {
      return this._storageService.flatten(results);
    }
    return results;
  }
}
