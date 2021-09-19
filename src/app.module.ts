import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DefinitionsModule } from './features/definitions';
import { GoogleSignInModule } from './features/google-sign-in';
import { NodeController, PrimitiveStorageModule } from './features/primitive-storage';
import { SmsModule } from './features/sms';
import { MsgPackMiddleware } from './shared/middleware';
import { ActionFlowModule } from './shared/services/action-flow';
import { BackupManagerServiceModule } from './shared/services/backup-manager';
import { ExporterModule } from './shared/services/exporter';
import { LogLevelManagerModule } from './shared/services/log-level-manager';

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
    SmsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MsgPackMiddleware).forRoutes(NodeController);
  }
}
