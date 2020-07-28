import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/shared/services/firebase/service/firebase.service';

import { CollectorAggregate, CollectorResults, ExporterConfigFirebase } from '../../type';

@Injectable()
export class FirebaseSaverService {
  constructor(private readonly _firebaseService: FirebaseService) {}

  async save(node: string, param: string, config: ExporterConfigFirebase, value: CollectorResults) {
    const path = config?.path || `${node}/${param}`;
    return Array.isArray(value) ? this.saveMany(path, value) : this.saveOne(path, value);
  }

  async saveOne(path: string, value: number | object): Promise<void> {
    return this._firebaseService.saveVar(value, path);
  }

  async saveMany(path: string, values: CollectorAggregate): Promise<void> {
    const output = (values || []).reduce((result, item) => {
      result[item.ts] = item.value;
      return result;
    }, {});
    return this._firebaseService.saveView(output, path);
  }
}
