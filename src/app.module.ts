import { NodeController } from './features/primitive-storage/controller/node/node.controller';
import { MsgPackMiddleware } from './shared/middleware/msg-pack-middleware/msg-pack-middleware';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrimitiveStorageModule } from './features/primitive-storage/primitive-storage.module';
import { DefinitionsModule } from './features/definitions/definitions.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrimitiveStorageModule, DefinitionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MsgPackMiddleware).forRoutes(NodeController);
  }
}
