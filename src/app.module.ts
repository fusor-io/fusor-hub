import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DefinitionsModule } from './features/definitions/definitions.module';
import { GoogleSignInModule } from './features/google-sign-in/google-sign-in.module';
import { NodeController } from './features/primitive-storage/controller/node/node.controller';
import { PrimitiveStorageModule } from './features/primitive-storage/primitive-storage.module';
import { MsgPackMiddleware } from './shared/middleware/msg-pack-middleware/msg-pack-middleware';
import { ActionFlowModule } from './shared/services/action-flow/action-flow.module';
import { BackupManagerServiceModule } from './shared/services/backup-manager/backup-manager-service.module';
import { ExporterModule } from './shared/services/exporter/exporter.module';
import { LogLevelManagerModule } from './shared/services/log-level-manager/log-level-manager.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrimitiveStorageModule,
    DefinitionsModule,
    GoogleSignInModule,
    ExporterModule,
    BackupManagerServiceModule,
    LogLevelManagerModule,
    ActionFlowModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MsgPackMiddleware).forRoutes(NodeController);
  }
}
