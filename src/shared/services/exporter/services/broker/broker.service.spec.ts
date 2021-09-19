import { Test, TestingModule } from '@nestjs/testing';

import { CronService } from '../../../cron';
import { ParamsService } from '../../../params';
import { ExporterService } from '../exporter/exporter.service';
import { ExportBrokerService } from './broker.service';

describe('BrokerService', () => {
  let service: ExportBrokerService;

  beforeEach(async () => {
    jest.useFakeTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportBrokerService,
        {
          provide: ExporterService,
          useValue: {
            getCronExporter: () => [],
          },
        },
        {
          provide: ParamsService,
          useValue: { registerWriteHook: () => null, filterParams: () => [] },
        },
        {
          provide: CronService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ExportBrokerService>(ExportBrokerService);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
