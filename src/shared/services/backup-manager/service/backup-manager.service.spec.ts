import { Test, TestingModule } from '@nestjs/testing';

import { BackupService } from '../../backup';
import { CronService } from '../../cron';
import { DefinitionsService } from '../../definitions';
import { BackupManagerService } from './backup-manager.service';

describe('BackupManagerService', () => {
  let service: BackupManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupManagerService,
        {
          provide: BackupService,
          useValue: {},
        },
        {
          provide: DefinitionsService,
          useValue: {},
        },
        {
          provide: CronService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BackupManagerService>(BackupManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
