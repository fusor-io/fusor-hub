import { Module } from '@nestjs/common';
import { StorageController } from './controller/storage.controller';
import { StorageService } from './service/storage.service';
import { DatabaseModule } from 'src/shared/services/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
