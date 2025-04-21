import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { config as envConfig } from 'dotenv';
import { ResponseModule } from '../response/response.module';
import { UsersModule } from '../users/users.module';
import { StaffsModule } from '../staffs/staffs.module';
import { FirebaseAdmin } from '../firebase/firebase.service';
envConfig();
@Module({
  imports: [ResponseModule, UsersModule, StaffsModule],
  providers: [AuthService, FirebaseAdmin],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
