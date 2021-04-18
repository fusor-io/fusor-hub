import { Test, TestingModule } from '@nestjs/testing';

import { StorageService } from '../../service/storage.service';
import { AggregateController } from './aggregate.controller';

describe('Aggregate Controller', () => {
  let controller: AggregateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AggregateController],
      providers: [{
        provide: StorageService,
        useValue: {}
      }]
    }).compile();

    controller = module.get<AggregateController>(AggregateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
