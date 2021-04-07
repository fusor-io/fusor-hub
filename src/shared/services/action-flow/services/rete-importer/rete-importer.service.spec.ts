import { Test, TestingModule } from '@nestjs/testing';
import { BehaviorSubject } from 'rxjs';

import { sleep } from '../../../../../shared/utils/sleep';
import { CronService } from '../../../cron';
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
            readDefinitions: () => [{ key: 'test', definition: reteMock }],
          },
        },
        {
          provide: ParamsService,
          useValue: { paramUpdates$, emitCurrentValues: () => null },
        },
        {
          provide: CronService,
          useValue: { schedule: () => null },
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
    expect(await service.import()).toBeUndefined;
    expect(buildFlowFn).toBeCalledWith(reteMock);
    expect(Object.keys(service[`_flows`]).length).toEqual(1);
  });

  it('should skip re-init if definitions are unchanged', async () => {
    const buildFlowFn = jest.spyOn(service, 'buildFlow').mockReturnValue(true);
    await service.import();
    expect(buildFlowFn).toBeCalledWith(reteMock);

    buildFlowFn.mockClear();
    await service.import();
    expect(buildFlowFn).not.toBeCalled();
  });

  it('should build', async () => {
    const status = service.buildFlow(reteMock as any);
    expect(status).toBe(true);
    expect(Object.keys(service[`_flowSet`]).length).toEqual(5);
  });

  it('should run', async () => {
    service.buildFlow(reteMock as any);
    const logEventFn = jest.spyOn(service[`_flowSet`]['4'] as any, '_logEvent');

    paramUpdates$.next({ nodeId: 'node1', paramId: 'param1', value: 1 });
    await sleep(0);
    paramUpdates$.next({ nodeId: 'node1', paramId: 'param2', value: 2 });
    await sleep(0);
    paramUpdates$.next({ nodeId: 'node1', paramId: 'param1', value: 42 });
    await sleep(0);

    expect(logEventFn).toBeCalledTimes(1);
    expect(logEventFn).toBeCalledWith({ value: 42 });
  });

  it('should schedule', async () => {
    const cron = module.get<CronService>(CronService);
    const scheduleFn = jest.spyOn(cron, 'schedule');
    await service.schedule();
    expect(scheduleFn).toBeCalled();
  });

  it('should destroy', async () => {
    const status = service.buildFlow(reteMock as any);
    service[`_destroy`]();
    expect(service[`_flows`].length).toEqual(0);
    expect(service[`_flowSet`]).toBeUndefined;
  });
});
