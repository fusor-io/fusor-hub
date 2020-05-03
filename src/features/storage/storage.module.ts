import { Module } from '@nestjs/common';
import { StorageController } from './controller/storage.controller';
import { StorageService } from './service/storage.service';
import { MysqlModule } from 'src/shared/services/mysql/mysql.module';

@Module({
  imports: [MysqlModule],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
