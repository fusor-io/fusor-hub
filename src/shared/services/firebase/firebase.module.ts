import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { FirebaseService } from 'src/shared/services/firebase/service/firebase.service';

@Module({
  imports: [ConfigModule],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
