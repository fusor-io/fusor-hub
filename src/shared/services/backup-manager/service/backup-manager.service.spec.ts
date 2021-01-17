import { Test, TestingModule } from '@nestjs/testing';

import { BackupManagerService } from './backup-manager.service';

describe('BackupManagerService', () => {
  let service: BackupManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BackupManagerService],
    }).compile();

    service = module.get<BackupManagerService>(BackupManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
