import { Test, TestingModule } from '@nestjs/testing';

import { GoogleSignInService } from '../../../shared/services/google-sign-in';
import { GoogleSignInController } from './google-sign-in.controller';

describe('GoogleSignIn Controller', () => {
  let controller: GoogleSignInController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleSignInController],
      providers: [{ provide: GoogleSignInService, useValue: {} }],
    }).compile();

    controller = module.get<GoogleSignInController>(GoogleSignInController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
