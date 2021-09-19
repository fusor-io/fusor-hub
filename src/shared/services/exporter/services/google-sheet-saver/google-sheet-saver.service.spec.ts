import { Test, TestingModule } from '@nestjs/testing';

import { GoogleSignInService } from './../../../google-sign-in/service/google-sign-in.service';
import { JsonataService } from './../jsonata/jsonata.service';
import { GoogleSheetSaverService } from './google-sheet-saver.service';

describe('GoogleSheetSaverService', () => {
  let service: GoogleSheetSaverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleSheetSaverService,
        {
          provide: GoogleSignInService,
          useValue: {},
        },
        {
          provide: JsonataService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GoogleSheetSaverService>(GoogleSheetSaverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
