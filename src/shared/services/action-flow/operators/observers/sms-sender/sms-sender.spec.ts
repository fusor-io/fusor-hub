import { Test } from '@nestjs/testing';
import { BehaviorSubject } from 'rxjs';

import { MessagingService } from '../../../../messaging';
import { FlowEvent } from '../../../services/action-flow';
import { INPUT_IN } from './const';
import { SmsSenderOperator } from './sms-sender';

describe('SmsSenderOperator', () => {
  let smsSender: SmsSenderOperator;
  let messagingService: MessagingService;
  const valueMock = { value: 42 };
  const configMock1 = { recipient: '+12345678', text: 'value {in}' };
  const configMock2 = { recipient: '+12345678', text: '' };
  const configMock3 = { recipient: '', text: '' };

  let emitterMock = new BehaviorSubject<FlowEvent | undefined>(valueMock);

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: MessagingService,
          useValue: { send: () => null },
        },
      ],
    }).compile();
    smsSender = new SmsSenderOperator(module as any);
    messagingService = module.get<MessagingService>(MessagingService);
  });

  it('should create', () => {
    expect(smsSender).toBeTruthy;
  });

  it('should know expected inputs', () => {
    expect(smsSender.expectedInputs).toEqual([INPUT_IN]);
  });

  it('should check void wires', () => {
    expect(smsSender.isFullyWired).toBe(false);
  });

  it('should respect unknown wires', () => {
    expect(smsSender.attachInput('some-unknown', emitterMock)).toBe(false);
  });

  it('should accept known wires', () => {
    expect(smsSender.attachInput(INPUT_IN, emitterMock)).toBe(true);
    expect(smsSender.isFullyWired).toBe(true);
  });

  it('should init', () => {
    expect(smsSender.init(configMock1)).toBeUndefined;
  });

  it('should engage', () => {
    const eventSubscriptionFn = jest.spyOn(<any>smsSender, '_eventSubscription');
    expect(smsSender.init(configMock1)).toBeUndefined;
    smsSender.attachInput(INPUT_IN, emitterMock);

    expect(smsSender.engage()).toBe(true);
    expect(eventSubscriptionFn).toHaveBeenCalled();
  });

  it('should send sms', () => {
    const smsSendFn = jest.spyOn(messagingService, 'send').mockResolvedValue(true);
    expect(smsSender.init(configMock1)).toBeUndefined;
    smsSender.attachInput(INPUT_IN, emitterMock);
    smsSender.engage();

    expect(smsSendFn).toHaveBeenCalledWith(configMock1.recipient, 'value 42');
  });

  it('should not send sms if no recipient', () => {
    const smsSendFn = jest.spyOn(messagingService, 'send').mockResolvedValue(true);
    expect(smsSender.init(configMock3)).toBeUndefined;
    smsSender.attachInput(INPUT_IN, emitterMock);
    smsSender.engage();

    expect(smsSendFn).not.toHaveBeenCalled();
  });
});
