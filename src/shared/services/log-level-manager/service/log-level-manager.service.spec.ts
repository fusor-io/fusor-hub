import { Test, TestingModule } from '@nestjs/testing';
import { LogLevelManagerService } from './log-level-manager.service';

describe('LogLevelManagerService', () => {
  let service: LogLevelManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogLevelManagerService],
    }).compile();

    service = module.get<LogLevelManagerService>(LogLevelManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
