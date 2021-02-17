import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as MessagePack from 'msgpack-lite';

@Injectable()
export class MsgPackMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    const contentType = req.header('content-type');
    if (contentType === 'application/msgpack') {
      console.log(req.body.toString('hex'));
      req.body = MessagePack.decode(req.body);
    }
    next();
  }
}
