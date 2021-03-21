import { Test, TestingModule } from '@nestjs/testing';
import { ActionFlowService } from './action-flow.service';

describe('ActionFlowService', () => {
  let service: ActionFlowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActionFlowService],
    }).compile();

    service = module.get<ActionFlowService>(ActionFlowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
