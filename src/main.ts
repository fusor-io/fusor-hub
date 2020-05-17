import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as hidePoweredBy from 'hide-powered-by';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(hidePoweredBy());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(3000);
}
bootstrap();
