import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { DatabaseService } from '../../database/service/database.service';
import { DefinitionQueryResultDto } from '../dto';
import { DEFINITIONS_TABLE, DEFINITIONS_TABLE_NAME } from '../sql';
import { DefinitionQueryResult } from '../type';

@Injectable()
export class DefinitionsService {
  constructor(private readonly _databaseService: DatabaseService) {}

  async saveDefinition<T = object>(type: string, key: string, definition: T): Promise<void> {
    await this._databaseService.createTableIfNotExists(DEFINITIONS_TABLE, DEFINITIONS_TABLE_NAME);

    const json = JSON.stringify(definition);
    await this._databaseService.query({
      sql: `INSERT INTO ?? (\`type\`, \`key\`, \`definition\`) VALUES(?,?,?) 
            ON DUPLICATE KEY UPDATE \`definition\`=?, \`version\`=\`version\`+1`,
      values: [DEFINITIONS_TABLE_NAME, type, key, json, json],
    });
  }

  async readDefinition<T = object>(type: string, key: string): Promise<DefinitionQueryResult<T>> {
    const results = await this._databaseService.query<DefinitionQueryResultDto<T>>({
      sql: `SELECT \`definition\`, UNIX_TIMESTAMP(\`ts\`) as ts FROM ?? WHERE \`type\`=? AND \`key\`=? LIMIT 1`,
      values: [DEFINITIONS_TABLE_NAME, type, key],
    });
    const definitions = plainToClass(DefinitionQueryResultDto, results);
    return (
      definitions && definitions[0] && (definitions[0] as DefinitionQueryResultDto<T>).toModel()
    );
  }

  async readDefinitions<T = object>(type: string): Promise<DefinitionQueryResult<T>[]> {
    const results = await this._databaseService.query<DefinitionQueryResultDto<T>>({
      sql: `SELECT \`key\`, \`definition\`, UNIX_TIMESTAMP(\`ts\`) as ts FROM ?? WHERE \`type\`=? `,
      values: [DEFINITIONS_TABLE_NAME, type],
    });
    const definitions = plainToClass(DefinitionQueryResultDto, results);
    return (
      definitions &&
      definitions.map((definition: DefinitionQueryResultDto<T>) => definition.toModel())
    );
  }
}
