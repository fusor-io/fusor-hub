import { Module, OnModuleInit } from '@nestjs/common';
import { MysqlService } from './service/mysql.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MysqlService],
  exports: [MysqlService],
})
export class MysqlModule implements OnModuleInit {
  constructor(private readonly _mySqlService: MysqlService) {}

  onModuleInit() {
    this._mySqlService.init();
  }
}
