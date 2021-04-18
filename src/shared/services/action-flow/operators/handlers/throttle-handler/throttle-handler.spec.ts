import { ReplaySubject } from 'rxjs';

import { sleep } from '../../../../../utils/sleep';
import { FlowEvent } from '../../../services/action-flow';
import { INPUT_NAMES, INPUT_VALUE, OUTPUT_OUT } from './const';
import { ThrottleHandlerOperator } from './throttle-handler';

describe('ThrottleHandlerOperator', () => {
  let distinctOperation: ThrottleHandlerOperator;
  const valueMock1 = { value: 42 };
  const mockConfig = { duration: 20 };

  let valueEmitterMock = new ReplaySubject<FlowEvent | undefined>();
  valueEmitterMock.next(valueMock1);

  beforeEach(async () => {
    distinctOperation = new ThrottleHandlerOperator(undefined);
  });

  it('should create', () => {
    expect(distinctOperation).toBeTruthy;
  });

  it('should know expected inputs', () => {
    expect(distinctOperation.expectedInputs).toEqual(INPUT_NAMES);
  });

  it('should check void wires', () => {
    expect(distinctOperation.isFullyWired).toBe(false);
  });

  it('should respect unknown wires', () => {
    expect(distinctOperation.attachInput('some-unknown', valueEmitterMock)).toBe(false);
  });

  it('should accept known wires', () => {
    expect(distinctOperation.attachInput(INPUT_VALUE, valueEmitterMock)).toBe(true);
    expect(distinctOperation.isFullyWired).toBe(true);
  });

  it('should init', () => {
    expect(distinctOperation.init(mockConfig)).toBeUndefined;
  });

  describe('throttle behavior', () => {
    it('should engage', () => {
      distinctOperation.attachInput(INPUT_VALUE, valueEmitterMock);
      distinctOperation.init(mockConfig);
      expect(distinctOperation.engage()).toBe(true);
    });

    it('should pass first value', done => {
      distinctOperation.attachInput(INPUT_VALUE, valueEmitterMock);
      distinctOperation.init(mockConfig);
      distinctOperation.engage();
      distinctOperation.outputs[OUTPUT_OUT].subscribe(value => {
        expect(value).toEqual(valueMock1);
        done();
      });
    });

    it('should throttle', async () => {
      let valueEmitterMock = new ReplaySubject<FlowEvent | undefined>();
      distinctOperation.attachInput(INPUT_VALUE, valueEmitterMock);
      distinctOperation.init(mockConfig);
      distinctOperation.engage();

      const accumulator = [];
      const subscription = distinctOperation.outputs[OUTPUT_OUT].subscribe(value => {
        accumulator.push(value);
      });

      // TODO find a way to use fakeTimers for this
      valueEmitterMock.next(valueMock1); // skip
      await sleep(1);
      valueEmitterMock.next(valueMock1); // skip
      await sleep(1);
      valueEmitterMock.next(valueMock1); // skip
      await sleep(21);
      valueEmitterMock.next(valueMock1); // pass

      expect(accumulator.length).toEqual(2);

      subscription.unsubscribe();
    });
  });
});
