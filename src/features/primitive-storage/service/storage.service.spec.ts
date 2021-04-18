import { Test, TestingModule } from '@nestjs/testing';

import { AggregatesService } from '../../../shared/services/aggregates';
import { ParamsService } from './../../../shared/services/params';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ParamsService,
          useValue: {},
        },
        {
          provide: AggregatesService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
