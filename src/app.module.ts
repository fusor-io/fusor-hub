import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DefinitionsModule } from './features/definitions/definitions.module';
import { NodeController } from './features/primitive-storage/controller/node/node.controller';
import { PrimitiveStorageModule } from './features/primitive-storage/primitive-storage.module';
import { MsgPackMiddleware } from './shared/middleware/msg-pack-middleware/msg-pack-middleware';
import { ExporterModule } from './shared/services/exporter/exporter.module';
import { SchedulerModule } from './shared/services/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrimitiveStorageModule,
    DefinitionsModule,
    SchedulerModule,
    ExporterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MsgPackMiddleware).forRoutes(NodeController);
  }
}
