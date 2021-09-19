import { Test, TestingModule } from '@nestjs/testing';

import { DatabaseService } from '../../database';
import { ParamsService } from '../../params';
import { AggregatesService } from './aggregates.service';

describe('AggregatesService', () => {
  let service: AggregatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AggregatesService,
        {
          provide: DatabaseService,
          useValue: {},
        },
        {
          provide: ParamsService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AggregatesService>(AggregatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
