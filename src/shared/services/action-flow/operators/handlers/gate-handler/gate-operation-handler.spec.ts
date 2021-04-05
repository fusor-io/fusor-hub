import { BehaviorSubject } from 'rxjs';

import { FlowEvent } from '../../../services/action-flow';
import { INPUT_GATE, INPUT_NAMES, INPUT_VALUE, OUTPUT_OUT } from './const';
import { GateOperationHandler } from './gate-operation-handler';

describe('GateOperation', () => {
  let gateOperation: GateOperationHandler;
  const valueMock = { value: 42 };
  const gateOpenMock = { value: true };
  const gateClosedMock = { value: false };

  let valueEmitterMock = new BehaviorSubject<FlowEvent | undefined>(valueMock);
  let gateEmitterMock = new BehaviorSubject<FlowEvent | undefined>(gateOpenMock);

  beforeEach(async () => {
    gateOperation = new GateOperationHandler(undefined);
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

  describe('eval', () => {
    beforeEach(() => {
      gateOperation.attachInput(INPUT_VALUE, valueEmitterMock);
      gateOperation.attachInput(INPUT_GATE, gateEmitterMock);
    });

    it('should engage', () => {
      gateOperation.init();
      expect(gateOperation.engage()).toBe(true);
    });

    it('should pass gate', done => {
      gateOperation.init();
      gateOperation.engage();
      gateOperation.outputs[OUTPUT_OUT].subscribe(value => {
        expect(value).toEqual({ value: valueMock.value });
        done();
      });
    });

    // TODO test gate blocking
  });
});
