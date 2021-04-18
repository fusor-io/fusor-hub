import { Test, TestingModule } from '@nestjs/testing';

import { DefinitionsService } from '../../../shared/services/definitions';
import { DefinitionsController } from './definitions.controller';

describe('Definitions Controller', () => {
  let controller: DefinitionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DefinitionsController],
      providers: [
        {
          provide: DefinitionsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<DefinitionsController>(DefinitionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
