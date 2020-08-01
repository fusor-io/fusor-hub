import { Module } from '@nestjs/common';
import { AggregatesServiceModule } from 'src/shared/services/aggregates/aggregates-service.module';
import { DefinitionsServiceModule } from 'src/shared/services/definitions/definitions-service.module';
import { FirebaseModule } from 'src/shared/services/firebase/firebase.module';
import { ParamsServiceModule } from 'src/shared/services/params/params-service.module';

import { ExportBrokerService } from './services/broker/broker.service';
import { CollectorService } from './services/collector/collector.service';
import { ExporterService } from './services/exporter/exporter.service';
import { FirebaseSaverService } from './services/fire-base-saver/firebase-saver.service';
import { GoogleSheetSaverService } from './services/google-sheet-saver/google-sheet-saver.service';

@Module({
  imports: [
    DefinitionsServiceModule,
    FirebaseModule,
    AggregatesServiceModule,
    ParamsServiceModule,
  ],
  providers: [
    ExportBrokerService,
    ExporterService,
    CollectorService,
    FirebaseSaverService,
    GoogleSheetSaverService,
  ],
  exports: [ExportBrokerService],
})
export class ExporterModule {
  constructor(private readonly _broker: ExportBrokerService) {}
}
