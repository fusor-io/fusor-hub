import { Test, TestingModule } from '@nestjs/testing';

import { CronService } from '../../cron';
import { ParamsService } from '../../params';
import { LogLevelManagerService } from './log-level-manager.service';

describe('LogLevelManagerService', () => {
  let service: LogLevelManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogLevelManagerService,
        {
          provide: ParamsService,
          useValue: {},
        },
        {
          provide: CronService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<LogLevelManagerService>(LogLevelManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
