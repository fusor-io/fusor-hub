import { Module } from '@nestjs/common';
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
export class AppModule {}
