import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrimitiveStorageModule } from './features/primitive-storage/primitive-storage.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrimitiveStorageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
