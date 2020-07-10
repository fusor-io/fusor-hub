import { plainToClass } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/service/database.service';
import { DEFINITIONS_TABLE, DEFINITIONS_TABLE_NAME } from '../sql';
import { DefinitionQueryResultDto } from '../dto';
import { DefinitionQueryResult } from '../type';

@Injectable()
export class DefinitionsService {
  constructor(private readonly _databaseService: DatabaseService) {}

  async saveDefinition(type: string, nodeId: string, definition: object): Promise<void> {
    await this._databaseService.createTableIfNotExists(DEFINITIONS_TABLE, DEFINITIONS_TABLE_NAME);

    const json = JSON.stringify(definition);
    await this._databaseService.query({
      sql: `INSERT INTO ?? (\`type\`, \`node\`, \`definition\`) VALUES(?,?,?) 
            ON DUPLICATE KEY UPDATE \`definition\`=?, \`version\`=\`version\`+1`,
      values: [DEFINITIONS_TABLE_NAME, type, nodeId, json, json],
    });
  }

  async readDefinition(type: string, nodeId: string): Promise<DefinitionQueryResult> {
    const results = await this._databaseService.query<DefinitionQueryResultDto>({
      sql: `SELECT \`definition\`, UNIX_TIMESTAMP(\`ts\`) as ts FROM ?? WHERE \`type\`=? AND \`node\`=? LIMIT 1`,
      values: [DEFINITIONS_TABLE_NAME, type, nodeId],
    });
    const definitions = plainToClass(DefinitionQueryResultDto, results);
    return definitions && definitions[0] && definitions[0].toModel();
  }

  async readDefinitions(type: string): Promise<DefinitionQueryResult[]> {
    const results = await this._databaseService.query<DefinitionQueryResultDto>({
      sql: `SELECT \`node\`, \`definition\`, UNIX_TIMESTAMP(\`ts\`) as ts FROM ?? WHERE \`type\`=? `,
      values: [DEFINITIONS_TABLE_NAME, type],
    });
    const definitions = plainToClass(DefinitionQueryResultDto, results);
    return definitions && definitions.map(definition => definition.toModel());
  }
}
