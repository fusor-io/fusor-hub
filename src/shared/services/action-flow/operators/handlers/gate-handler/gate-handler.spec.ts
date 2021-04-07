import { ReplaySubject } from 'rxjs';

import { sleep } from '../../../../../utils/sleep';
import { FlowEvent } from '../../../services/action-flow';
import { INPUT_GATE, INPUT_NAMES, INPUT_VALUE, OUTPUT_OUT } from './const';
import { GateHandlerOperator } from './gate-handler';

describe('GateHandlerOperator', () => {
  let gateOperation: GateHandlerOperator;
  const valueMock1 = { value: 1 };
  const valueMock2 = { value: 2 };
  const valueMock3 = { value: 3 };
  const valueMock4 = { value: 5 };
  const gateOpenMock = { value: true };
  const gateClosedMock = { value: false };

  let valueEmitterMock = new ReplaySubject<FlowEvent | undefined>();
  valueEmitterMock.next(valueMock1);
  let gateEmitterMock = new ReplaySubject<FlowEvent | undefined>();
  gateEmitterMock.next(gateOpenMock);

  beforeEach(async () => {
    gateOperation = new GateHandlerOperator(undefined);
  });

  it('should create', () => {
    expect(gateOperation).toBeTruthy;
  });

  it('should know expected inputs', () => {
    expect(gateOperation.expectedInputs).toEqual(INPUT_NAMES);
  });

  it('should check void wires', () => {
    expect(gateOperation.isFullyWired).toBe(false);
  });

  it('should respect unknown wires', () => {
    expect(gateOperation.attachInput('some-unknown', valueEmitterMock)).toBe(false);
  });

  it('should accept known wires', () => {
    expect(gateOperation.attachInput(INPUT_VALUE, valueEmitterMock)).toBe(true);
    expect(gateOperation.attachInput(INPUT_GATE, gateEmitterMock)).toBe(true);
    expect(gateOperation.isFullyWired).toBe(true);
  });

  it('should init', () => {
    expect(gateOperation.init()).toBeUndefined;
  });

  describe('gate behavior', () => {
    it('should engage', () => {
      gateOperation.attachInput(INPUT_VALUE, valueEmitterMock);
      gateOperation.attachInput(INPUT_GATE, gateEmitterMock);
      gateOperation.init();
      expect(gateOperation.engage()).toBe(true);
    });

    it('should pass gate', done => {
      gateOperation.attachInput(INPUT_VALUE, valueEmitterMock);
      gateOperation.attachInput(INPUT_GATE, gateEmitterMock);
      gateOperation.init();
      gateOperation.engage();
      gateOperation.outputs[OUTPUT_OUT].subscribe(value => {
        expect(value).toEqual({ value: valueMock1.value });
        done();
      });
    });

    it('should block gate', async () => {
      let valueEmitterMock = new ReplaySubject<FlowEvent | undefined>();
      let gateEmitterMock = new ReplaySubject<FlowEvent | undefined>();
      gateOperation.attachInput(INPUT_VALUE, valueEmitterMock);
      gateOperation.attachInput(INPUT_GATE, gateEmitterMock);
      gateOperation.init();
      gateOperation.engage();

      const accumulator = [];

      const subscription = gateOperation.outputs[OUTPUT_OUT].subscribe(value => {
        accumulator.push(value);
      });

      // first one pass even if gates first value is postponed
      valueEmitterMock.next(valueMock1);
      // skip two JS cycles
      await sleep(0);
      await sleep(0);
      gateEmitterMock.next(gateOpenMock);
      await sleep();

      // second one to pass
      valueEmitterMock.next(valueMock2);
      await sleep();

      // third one to block
      gateEmitterMock.next(gateClosedMock);
      valueEmitterMock.next(valueMock3);
      await sleep();

      // forth one to pass
      gateEmitterMock.next(gateOpenMock);
      valueEmitterMock.next(valueMock4);
      await sleep();

      subscription.unsubscribe();
      expect(accumulator).toEqual([valueMock1, valueMock2, valueMock4]);
    });
  });
});
