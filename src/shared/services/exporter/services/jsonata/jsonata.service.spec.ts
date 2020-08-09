import { Test, TestingModule } from '@nestjs/testing';
import { JsonataService } from './jsonata.service';

describe('JsonataService', () => {
  let service: JsonataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsonataService],
    }).compile();

    service = module.get<JsonataService>(JsonataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
