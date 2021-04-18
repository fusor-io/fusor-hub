import { Test, TestingModule } from '@nestjs/testing';

import { DatabaseService } from '../../database';
import { ParamsService } from './params.service';

describe('ParamsService', () => {
  let service: ParamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParamsService,
        {
          provide: DatabaseService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ParamsService>(ParamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
