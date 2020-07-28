import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseSaverService } from './firebase-saver.service';

describe('FirebaseSaverService', () => {
  let service: FirebaseSaverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseSaverService],
    }).compile();

    service = module.get<FirebaseSaverService>(FirebaseSaverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
