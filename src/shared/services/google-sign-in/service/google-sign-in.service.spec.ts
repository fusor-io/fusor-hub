import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { DefinitionsService } from '../../definitions';
import { GoogleSignInService } from './google-sign-in.service';

describe('GoogleSignInService', () => {
  let service: GoogleSignInService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleSignInService,
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: DefinitionsService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GoogleSignInService>(GoogleSignInService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
