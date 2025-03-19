import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { config as envConfig } from 'dotenv';
import { ResponseModule } from 'src/response/response.module';
import { UserModule } from 'src/user/user.module';
import { StaffModule } from 'src/staff/staff.module';
import { FirebaseAdmin } from '../firebase/firebase.service';
envConfig();
@Module({
  imports: [ResponseModule, UserModule, StaffModule],
  providers: [AuthService, FirebaseAdmin],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
