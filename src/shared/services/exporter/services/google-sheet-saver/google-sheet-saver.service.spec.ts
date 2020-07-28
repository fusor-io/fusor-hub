import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSheetSaverService } from './google-sheet-saver.service';

describe('GoogleSheetSaverService', () => {
  let service: GoogleSheetSaverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleSheetSaverService],
    }).compile();

    service = module.get<GoogleSheetSaverService>(GoogleSheetSaverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
