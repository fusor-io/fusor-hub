import { Module, forwardRef } from '@nestjs/common';

import { ParamsServiceModule } from '../../services/params/params-service.module';
import { AggregatesServiceModule } from '../aggregates/aggregates-service.module';
import { DefinitionsServiceModule } from '../definitions/definitions-service.module';
import { FirebaseModule } from '../firebase/firebase.module';
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
    forwardRef(() => ParamsServiceModule),
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
