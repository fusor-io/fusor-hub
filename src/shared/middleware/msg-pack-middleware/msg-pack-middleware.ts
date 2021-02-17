import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as msgpack from 'msgpack';

// import * as MessagePack from 'msgpack-lite';
@Injectable()
export class MsgPackMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    const contentType = req.header('content-type');
    if (contentType === 'application/msgpack') {
      // req.body = MessagePack.decode(req.body);
      req.body = msgpack.unpack(req.body);
    }
    next();
  }
}
