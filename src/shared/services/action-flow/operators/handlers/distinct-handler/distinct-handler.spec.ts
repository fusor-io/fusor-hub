import { ReplaySubject } from 'rxjs';

import { sleep } from '../../../../../utils/sleep';
import { FlowEvent } from '../../../services/action-flow';
import { INPUT_NAMES, INPUT_VALUE, OUTPUT_OUT } from './const';
import { DistinctHandlerOperator } from './distinct-handler';

describe('DistinctHandlerOperator', () => {
  let distinctOperation: DistinctHandlerOperator;
  const valueMock1 = { value: 3 };
  const valueMock2 = { value: 3.1 };
  const valueMock3 = { value: 3.14 };

  let valueEmitterMock = new ReplaySubject<FlowEvent | undefined>();
  valueEmitterMock.next(valueMock1);

  beforeEach(async () => {
    distinctOperation = new DistinctHandlerOperator(undefined);
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
    expect(distinctOperation.init()).toBeUndefined;
  });

  describe('distinct behavior', () => {
    it('should engage', () => {
      distinctOperation.attachInput(INPUT_VALUE, valueEmitterMock);
      distinctOperation.init();
      expect(distinctOperation.engage()).toBe(true);
    });

    it('should pass first value', done => {
      distinctOperation.attachInput(INPUT_VALUE, valueEmitterMock);
      distinctOperation.init();
      distinctOperation.engage();
      distinctOperation.outputs[OUTPUT_OUT].subscribe(value => {
        expect(value).toEqual(valueMock1);
        done();
      });
    });

    it('should pass on changes only', async () => {
      let valueEmitterMock = new ReplaySubject<FlowEvent | undefined>();
      distinctOperation.attachInput(INPUT_VALUE, valueEmitterMock);
      distinctOperation.init();
      distinctOperation.engage();

      const accumulator = [];
      const subscription = distinctOperation.outputs[OUTPUT_OUT].subscribe(value => {
        accumulator.push(value);
      });

      valueEmitterMock.next(valueMock1);
      valueEmitterMock.next(valueMock1);
      valueEmitterMock.next(valueMock1);
      await sleep();

      valueEmitterMock.next(valueMock2);
      valueEmitterMock.next(valueMock2);
      valueEmitterMock.next(valueMock2);
      await sleep();

      valueEmitterMock.next(valueMock3);
      valueEmitterMock.next(valueMock3);
      valueEmitterMock.next(valueMock3);
      await sleep();

      expect(accumulator.length).toEqual(3);

      subscription.unsubscribe();
    });
  });
});
