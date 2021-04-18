import { Test, TestingModule } from '@nestjs/testing';

import { AggregatesService } from '../../../aggregates';
import { ParamsService } from '../../../params';
import { CollectorService } from './collector.service';

describe('CollectorService', () => {
  let service: CollectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectorService,
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

    service = module.get<CollectorService>(CollectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
