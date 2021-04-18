import { ReplaySubject } from 'rxjs';

import { sleep } from '../../../../../utils/sleep';
import { FlowEvent } from '../../../services/action-flow';
import { ChangeCountHandlerOperator } from './change-count-handler';
import { INPUT_NAMES, INPUT_VALUE, OUTPUT_OUT } from './const';

describe('ChangeCountHandlerOperator', () => {
  let changeCountOperation: ChangeCountHandlerOperator;
  const valueMock1 = { value: 1 };
  const valueMock2 = { value: 2 };
  const valueMock3 = { value: 3 };

  let valueEmitterMock = new ReplaySubject<FlowEvent | undefined>();
  valueEmitterMock.next(valueMock1);

  beforeEach(async () => {
    changeCountOperation = new ChangeCountHandlerOperator(undefined);
  });

  it('should create', () => {
    expect(changeCountOperation).toBeTruthy;
  });

  it('should know expected inputs', () => {
    expect(changeCountOperation.expectedInputs).toEqual(INPUT_NAMES);
  });

  it('should check void wires', () => {
    expect(changeCountOperation.isFullyWired).toBe(false);
  });

  it('should respect unknown wires', () => {
    expect(changeCountOperation.attachInput('some-unknown', valueEmitterMock)).toBe(false);
  });

  it('should accept known wires', () => {
    expect(changeCountOperation.attachInput(INPUT_VALUE, valueEmitterMock)).toBe(true);
    expect(changeCountOperation.isFullyWired).toBe(true);
  });

  it('should init', () => {
    expect(changeCountOperation.init()).toBeUndefined;
  });

  describe('count behavior', () => {
    it('should engage', () => {
      changeCountOperation.attachInput(INPUT_VALUE, valueEmitterMock);
      changeCountOperation.init();
      expect(changeCountOperation.engage()).toBe(true);
    });

    it('should increment on first value', done => {
      changeCountOperation.attachInput(INPUT_VALUE, valueEmitterMock);
      changeCountOperation.init();
      changeCountOperation.engage();
      changeCountOperation.outputs[OUTPUT_OUT].subscribe(value => {
        expect(value).toEqual({ value: 1 });
        done();
      });
    });

    it('should increment on changes', async () => {
      let valueEmitterMock = new ReplaySubject<FlowEvent | undefined>();
      changeCountOperation.attachInput(INPUT_VALUE, valueEmitterMock);
      changeCountOperation.init();
      changeCountOperation.engage();

      let result = NaN;

      const subscription = changeCountOperation.outputs[OUTPUT_OUT].subscribe(
        value => (result = Number(value.value)),
      );

      valueEmitterMock.next(valueMock1);
      valueEmitterMock.next(valueMock1);
      valueEmitterMock.next(valueMock1);
      await sleep();

      expect(result).toEqual(1);

      valueEmitterMock.next(valueMock2);
      valueEmitterMock.next(valueMock2);
      valueEmitterMock.next(valueMock2);
      await sleep();

      expect(result).toEqual(2);

      valueEmitterMock.next(valueMock3);
      await sleep();

      expect(result).toEqual(3);
    });
  });
});
