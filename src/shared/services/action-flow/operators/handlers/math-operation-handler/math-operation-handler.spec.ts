import { BehaviorSubject } from 'rxjs';

import { FlowEvent } from '../../../services/action-flow';
import { INPUT_IN1, INPUT_IN2, INPUT_NAMES, OUTPUT_OUT } from './const';
import { MathOperationHandler } from './math-operation-handler';

describe('MathOperation', () => {
  let mathOperation: MathOperationHandler;
  const in1Mock = { value: 42 };
  const in2Mock = { value: 137 };
  const numExpressionMock = 'in1 + in2';
  const boolExpressionMock = 'in1 > in2';

  let in1EmitterMock = new BehaviorSubject<FlowEvent | undefined>(in1Mock);
  let in2EmitterMock = new BehaviorSubject<FlowEvent | undefined>(in2Mock);

  beforeEach(async () => {
    mathOperation = new MathOperationHandler(undefined);
  });

  it('should create', () => {
    expect(mathOperation).toBeTruthy;
  });

  it('should know expected inputs', () => {
    expect(mathOperation.expectedInputs).toEqual(INPUT_NAMES);
  });

  it('should check void wires', () => {
    expect(mathOperation.isFullyWired).toBe(false);
  });

  it('should respect unknown wires', () => {
    expect(mathOperation.attachInput('some-unknown', in1EmitterMock)).toBe(false);
  });

  it('should accept known wires', () => {
    expect(mathOperation.attachInput(INPUT_IN1, in1EmitterMock)).toBe(true);
    expect(mathOperation.attachInput(INPUT_IN2, in2EmitterMock)).toBe(true);
    expect(mathOperation.isFullyWired).toBe(true);
  });

  it('should init', () => {
    expect(mathOperation.init({ expression: numExpressionMock })).toBeUndefined;
  });

  describe('eval', () => {
    beforeEach(() => {
      mathOperation.attachInput(INPUT_IN1, in1EmitterMock);
      mathOperation.attachInput(INPUT_IN2, in2EmitterMock);
    });

    it('should engage', () => {
      mathOperation.init({ expression: numExpressionMock });
      expect(mathOperation.engage()).toBe(true);
    });

    it('should evaluate number', done => {
      mathOperation.init({ expression: numExpressionMock });
      mathOperation.engage();
      mathOperation.outputs[OUTPUT_OUT].subscribe(value => {
        expect(value).toEqual({ value: in1Mock.value + in2Mock.value });
        done();
      });
    });

    it('should evaluate boolean', done => {
      mathOperation.init({ expression: boolExpressionMock });
      mathOperation.engage();
      mathOperation.outputs[OUTPUT_OUT].subscribe(value => {
        expect(value).toEqual({ value: false });
        done();
      });
    });

    it('should handle exceptions', () => {
      const evalFn = jest.spyOn(<any>mathOperation, '_eval');
      const errorFn = jest
        .spyOn((<any>mathOperation)._logger, 'error')
        .mockImplementation(() => null);
      mathOperation.init({ expression: 'in1 / in2' });

      expect(mathOperation[`_eval`]({ in1: 1, in2: 0 })).toBeUndefined;

      expect(mathOperation[`_eval`]({ in1: 1 })).toBeUndefined;
      expect(errorFn).toBeCalled();
    });
  });
});
