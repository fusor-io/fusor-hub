import { Test } from '@nestjs/testing';
import { BehaviorSubject } from 'rxjs';

import { ParamsService, ParamUpdateEvent } from '../../../../params';
import { ParamEmitterConfig } from './config';
import { OUTPUT_PARAM, ParamEmitterOperator } from './param-emitter';

describe('ParamEmitter', () => {
  let paramEmitter: ParamEmitterOperator;
  const configMock: ParamEmitterConfig = { nodeId: 'node', paramId: 'param' };
  const valueMock = {
    nodeId: 'node',
    paramId: 'param',
    value: 137,
  };
  let paramUpdates$: BehaviorSubject<ParamUpdateEvent>;

  beforeEach(async () => {
    paramUpdates$ = new BehaviorSubject<ParamUpdateEvent>(valueMock);

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ParamsService,
          useValue: { paramUpdates$ },
        },
      ],
    }).compile();
    paramEmitter = new ParamEmitterOperator(module as any);
  });

  it('should create', () => {
    expect(paramEmitter).toBeTruthy;
    expect(paramEmitter.init(configMock)).toBeUndefined;
  });

  it('should init', done => {
    expect(paramEmitter.init(configMock)).toBeUndefined;
    expect(paramEmitter.outputs[OUTPUT_PARAM]).toBeDefined;
    paramEmitter.outputs[OUTPUT_PARAM].subscribe(value => {
      expect(value).toEqual(valueMock);
      done();
    });
  });
});
