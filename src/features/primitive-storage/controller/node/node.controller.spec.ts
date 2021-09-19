import { Test, TestingModule } from '@nestjs/testing';

import { StorageService } from '../../service/storage.service';
import { NodeController } from './node.controller';

describe('Node Controller', () => {
  let controller: NodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NodeController],
      providers: [{ provide: StorageService, useValue: {} }],
    }).compile();

    controller = module.get<NodeController>(NodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
