import { Injectable, Logger } from '@nestjs/common';

import { BackupService } from '../../backup';
import { CronService } from '../../cron';
import { DefinitionsService } from '../../definitions';
import { DEFINITIONS_FILE } from '../const/backup-data-ids.const';

@Injectable()
export class BackupManagerService {
  private readonly _logger = new Logger(this.constructor.name);

  constructor(
    private readonly _backupService: BackupService,
    private readonly _definitionService: DefinitionsService,
    private readonly _cronService: CronService,
  ) {}

  scheduleBackup(): void {
    this._logger.log('Scheduling daily backups to Google Cloud Store');
    // run backup daily at 1:00 AM
    this._cronService.schedule(this, 'backup', { second: 0, minute: 0, hour: 1 }, () =>
      this.backup(),
    );
  }

  async backup(): Promise<void> {
    this._logger.log('Starting backup');
    await this.backupDefinitions();
    this._logger.log('Backup finished');
  }

  async backupDefinitions(): Promise<void> {
    this._logger.log('Exporting definitions...');
    const allDefinitions = await this._definitionService.dumpAllDefinitions();
    if (await this._backupService.saveFileJson(DEFINITIONS_FILE, allDefinitions)) {
      this._logger.log('...done');
    } else {
      this._logger.log('...failed');
    }
  }
}
