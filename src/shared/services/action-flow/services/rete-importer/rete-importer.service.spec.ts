import { Test, TestingModule } from '@nestjs/testing';
import { BehaviorSubject } from 'rxjs';

import { DefinitionsService } from '../../../definitions';
import { ParamsService, ParamUpdateEvent } from '../../../params';
import * as reteMock from './definition-mock.json';
import { ReteImporterService } from './rete-importer.service';

describe('ReteImporterService', () => {
  let service: ReteImporterService;
  let paramUpdates$: BehaviorSubject<ParamUpdateEvent>;
  let module: TestingModule;

  beforeEach(async () => {
    paramUpdates$ = new BehaviorSubject<ParamUpdateEvent>({
      nodeId: 'test',
      paramId: 'test',
      value: 0,
    });

    module = await Test.createTestingModule({
      providers: [
        ReteImporterService,
        {
          provide: DefinitionsService,
          useValue: {
            readDefinition: () => ({ definition: reteMock }),
          },
        },
        {
          provide: ParamsService,
          useValue: { paramUpdates$ },
        },
      ],
    }).compile();

    service = module.get<ReteImporterService>(ReteImporterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should init', async () => {
    const buildFlowFn = jest.spyOn(service, 'buildFlow').mockReturnValue(true);
    const status = await service.import('test');
    expect(buildFlowFn).toBeCalledWith(reteMock);
    expect(status).toBe(true);
  });

  it('should build', async () => {
    const status = service.buildFlow(reteMock as any);
    expect(status).toBe(true);
    expect(Object.keys(service[`_operators`]).length).toEqual(4);
  });

  it('should run', async () => {
    service.buildFlow(reteMock as any);
    const logEventFn = jest.spyOn(service[`_operators`]['4'] as any, '_logEvent');
    paramUpdates$.next({ nodeId: 'node1', paramId: 'param1', value: 1 });
    paramUpdates$.next({ nodeId: 'node1', paramId: 'param2', value: 2 });
    expect(logEventFn).toBeCalledWith({ value: 3 });
  });
});
