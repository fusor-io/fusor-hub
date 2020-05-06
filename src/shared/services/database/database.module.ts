import { Module, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from './service/database.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly _mySqlService: DatabaseService) {}

  onModuleInit() {
    this._mySqlService.init();
  }
}
