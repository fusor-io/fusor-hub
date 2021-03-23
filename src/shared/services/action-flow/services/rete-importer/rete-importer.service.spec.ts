import { Test, TestingModule } from '@nestjs/testing';
import { ReteImporterService } from './rete-importer.service';

describe('ReteImporterService', () => {
  let service: ReteImporterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReteImporterService],
    }).compile();

    service = module.get<ReteImporterService>(ReteImporterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
