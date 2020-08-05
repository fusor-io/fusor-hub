import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSignInService } from './google-sign-in.service';

describe('GoogleSignInService', () => {
  let service: GoogleSignInService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleSignInService],
    }).compile();

    service = module.get<GoogleSignInService>(GoogleSignInService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
