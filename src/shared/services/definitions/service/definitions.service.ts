import { DatabaseService } from './../../database/service/database.service';
import { Injectable } from '@nestjs/common';
import { DEFINITIONS_TABLE, DEFINITIONS_TABLE_NAME } from '../sql';
import { DefinitionQueryResult } from '../type';

@Injectable()
export class DefinitionsService {
  constructor(private readonly _databaseService: DatabaseService) {}

  async saveDefinition(nodeId: string, definition: object): Promise<void> {
    await this._databaseService.createTableIfNotExists(DEFINITIONS_TABLE, DEFINITIONS_TABLE_NAME);

    const json = JSON.stringify(definition);
    await this._databaseService.query({
      sql: `INSERT INTO ?? (\`node\`, \`definition\`) VALUES(?,?) ON DUPLICATE KEY UPDATE \`definition\`=?`,
      values: [DEFINITIONS_TABLE_NAME, nodeId, json, json],
    });
  }

  async readDefinition(nodeId: string): Promise<object> {
    const results = await this._databaseService.query<DefinitionQueryResult>({
      sql: `SELECT \`definition\` FROM ?? WHERE \`node\`=? LIMIT 1`,
      values: [DEFINITIONS_TABLE_NAME, nodeId],
    });
    return results && results[0]?.definition && JSON.parse(results[0].definition);
  }
}
