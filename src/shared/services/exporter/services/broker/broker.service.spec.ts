import { Test, TestingModule } from '@nestjs/testing';

import { ExportBrokerService } from './broker.service';

describe('BrokerService', () => {
  let service: ExportBrokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExportBrokerService],
    }).compile();

    service = module.get<ExportBrokerService>(ExportBrokerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
