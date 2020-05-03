import { Controller, Get, Body, Post, Param } from '@nestjs/common';
import { NodePostPayload } from '../dto/node.dto';
import { StorageService } from '../service/storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly _storageService: StorageService) {}

  @Get('')
  helloWorld() {
    return 'hello';
  }

  @Post('/:node')
  post(@Body() body: NodePostPayload, @Param('node') node: string) {
    this._storageService._post(node, body);
  }
}
