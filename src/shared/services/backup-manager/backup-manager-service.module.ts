import { Module, OnModuleInit } from '@nestjs/common';

import { BackupServiceModule } from '../backup/backup-service.module';
import { DefinitionsServiceModule } from '../definitions/definitions-service.module';
import { BackupManagerService } from './service/backup-manager.service';

@Module({
  imports: [BackupServiceModule, DefinitionsServiceModule],
  providers: [BackupManagerService],
})
export class BackupManagerServiceModule implements OnModuleInit {
  constructor(private readonly _backupManagerService: BackupManagerService) {}

  onModuleInit() {
    // backup definitions on server start-up
    setTimeout(() => this._backupManagerService.backupDefinitions(), 5000);
    
    // full daily backup
    this._backupManagerService.scheduleBackup();
  }
}
