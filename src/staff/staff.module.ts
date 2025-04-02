import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { StaffEntity } from '../entities/staff.entity';
import { ResponseModule } from '../response/response.module';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffBranchEntity } from '../entities/staff_branch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaffEntity, StaffBranchEntity]),
    ResponseModule,
  ],
  controllers: [StaffController],
  providers: [StaffService, FirebaseAdmin],
  exports: [StaffService],
})
export class StaffModule {}
