import { Module } from '@nestjs/common';

import { BackupService } from './service/backup.service';

@Module({
  providers: [BackupService],
  exports: [BackupService],
})
export class BackupServiceModule {}
