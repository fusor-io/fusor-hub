import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSignInController } from './google-sign-in.controller';

describe('GoogleSignIn Controller', () => {
  let controller: GoogleSignInController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleSignInController],
    }).compile();

    controller = module.get<GoogleSignInController>(GoogleSignInController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
