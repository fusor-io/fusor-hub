import { BehaviorSubject } from 'rxjs';

import { FlowEvent } from '../../../services/action-flow';
import { INPUT_IN, LogWriterOperator } from './log-writer';

describe('LogWriter', () => {
  let logWriter: LogWriterOperator;
  const valueMock = { value: 42 };
  let emitterMock = new BehaviorSubject<FlowEvent | undefined>(valueMock);

  beforeEach(async () => {
    logWriter = new LogWriterOperator(undefined);
  });

  it('should create', () => {
    expect(logWriter).toBeTruthy;
  });

  it('should know expected inputs', () => {
    expect(logWriter.expectedInputs).toEqual([INPUT_IN]);
  });

  it('should check void wires', () => {
    expect(logWriter.isFullyWired).toBe(false);
  });

  it('should respect unknown wires', () => {
    expect(logWriter.attachInput('some-unknown', emitterMock)).toBe(false);
  });

  it('should accept known wires', () => {
    expect(logWriter.attachInput(INPUT_IN, emitterMock)).toBe(true);
    expect(logWriter.isFullyWired).toBe(true);
  });

  it('should engage', () => {
    const eventSubscriptionFn = jest.spyOn(<any>logWriter, '_eventSubscription');
    logWriter.attachInput(INPUT_IN, emitterMock);

    expect(logWriter.engage()).toBe(true);
    expect(eventSubscriptionFn).toHaveBeenCalled();
  });

  it('should log value', () => {
    const logEventFn = jest.spyOn(<any>logWriter, '_logEvent');
    logWriter.attachInput(INPUT_IN, emitterMock);
    logWriter.engage();

    expect(logEventFn).toHaveBeenCalledWith(valueMock);
  });
});
