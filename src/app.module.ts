import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageModule } from './features/storage/storage.module';
import { DatabaseModule } from './shared/services/database/database.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), StorageModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
