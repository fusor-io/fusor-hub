import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { FirebaseService } from './service/firebase.service';

@Module({
  imports: [ConfigModule],
  providers: [FirebaseService],
})
export class FirebaseModule {}
