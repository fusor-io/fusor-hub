import { Injectable } from '@nestjs/common';

import { FirebaseService } from '../../../firebase';
import { CollectorAggregate, ExporterConfigFirebase, ExporterContext } from '../../type';

@Injectable()
export class FirebaseSaverService {
  constructor(private readonly _firebaseService: FirebaseService) {}

  async save(context: ExporterContext, config: ExporterConfigFirebase) {
    const { param, node, value } = context;
    const path = config?.path || `${node}:${param}`;
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
