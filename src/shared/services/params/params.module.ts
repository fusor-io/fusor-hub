import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ParamsService } from './service/params.service';

@Module({
  imports: [DatabaseModule],
  providers: [ParamsService],
  exports: [ParamsService],
})
export class ParamsModule {}
