import { Test, TestingModule } from '@nestjs/testing';

import { DefinitionsService } from '../../../definitions';
import { ParamsService } from '../../../params';
import { CollectorService } from '../collector/collector.service';
import { FirebaseSaverService } from '../fire-base-saver/firebase-saver.service';
import { GoogleSheetSaverService } from '../google-sheet-saver/google-sheet-saver.service';
import { ExporterService } from './exporter.service';

describe('ExporterService', () => {
  let service: ExporterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExporterService,
        {
          provide: ParamsService,
          useValue: { filterParams: () => [] },
        },
        {
          provide: DefinitionsService,
          useValue: { readDefinitions: () => [] },
        },
        {
          provide: CollectorService,
          useValue: {},
        },
        {
          provide: FirebaseSaverService,
          useValue: {},
        },
        {
          provide: GoogleSheetSaverService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ExporterService>(ExporterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
