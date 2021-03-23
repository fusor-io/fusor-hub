import { Injectable } from '@nestjs/common';
import { DefinitionsService } from 'src/shared/services/definitions/service/definitions.service';

@Injectable()
export class ReteImporterService {
  constructor(private readonly _definitionsService: DefinitionsService) {}
}
