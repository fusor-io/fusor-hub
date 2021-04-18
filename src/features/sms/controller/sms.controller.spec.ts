import { Test, TestingModule } from '@nestjs/testing';

import { MessagingService } from '../../../shared/services/messaging';
import { SmsController } from './sms.controller';

describe('SmsController', () => {
  let controller: SmsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmsController],
      providers: [
        {
          provide: MessagingService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SmsController>(SmsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
