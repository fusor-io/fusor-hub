import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import bodyParser from 'body-parser';
import hidePoweredBy from 'hide-powered-by';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(hidePoweredBy());
  app.use(bodyParser.raw({ type: 'application/msgpack' }));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin: '*',
  });
  app.enableShutdownHooks();
  await app.listen(3000);
}
bootstrap();
