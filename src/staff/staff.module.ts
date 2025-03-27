import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { StaffEntity } from '../entities/staff.entity';
import { ResponseModule } from '../response/response.module';
import { FirebaseAdmin } from '../firebase/firebase.service';

@Module({
  imports: [TypeOrmModule.forFeature([StaffEntity]), ResponseModule],
  controllers: [StaffController],
  providers: [StaffService, FirebaseAdmin],
  exports: [StaffService],
})
export class StaffModule {}
