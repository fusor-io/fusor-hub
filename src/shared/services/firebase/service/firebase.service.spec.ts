import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import fireBase from 'firebase-admin';

import { FirebaseService } from './firebase.service';

jest.mock('firebase-admin');
const mockedFirebase = fireBase as jest.Mocked<typeof fireBase>;
const mockDatabase = () => ({
  ref: () => ({ child: () => null }),
});
mockedFirebase.database = mockDatabase as any;

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseService,
        {
          provide: ConfigService,
          useValue: { get: () => null },
        },
      ],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
