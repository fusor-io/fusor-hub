import { Module } from '@nestjs/common';

import { AggregatesServiceModule } from '../aggregates';
import { CronModule } from '../cron';
import { DefinitionsServiceModule } from '../definitions';
import { FirebaseModule } from '../firebase';
import { GoogleSignInServiceModule } from '../google-sign-in';
import { ParamsServiceModule } from '../params';
import { ExportBrokerService } from './services/broker/broker.service';
import { CollectorService } from './services/collector/collector.service';
import { ExporterService } from './services/exporter/exporter.service';
import { FirebaseSaverService } from './services/fire-base-saver/firebase-saver.service';
import { GoogleSheetSaverService } from './services/google-sheet-saver/google-sheet-saver.service';
import { JsonataService } from './services/jsonata/jsonata.service';

@Module({
  imports: [
    DefinitionsServiceModule,
    FirebaseModule,
    AggregatesServiceModule,
    ParamsServiceModule,
    GoogleSignInServiceModule,
    CronModule,
  ],
  providers: [
    ExportBrokerService,
    ExporterService,
    CollectorService,
    FirebaseSaverService,
    GoogleSheetSaverService,
    JsonataService,
  ],
  exports: [ExportBrokerService],
})
export class ExporterModule {
  constructor(private readonly _broker: ExportBrokerService) {}
}
