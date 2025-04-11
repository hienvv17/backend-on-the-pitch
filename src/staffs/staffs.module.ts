import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffsController } from './staffs.controller';
import { StaffsService } from './staffs.service';
import { StaffEntity } from '../entities/staff.entity';
import { ResponseModule } from '../response/response.module';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffBranchEntity } from '../entities/staff_branch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaffEntity, StaffBranchEntity]),
    ResponseModule,
  ],
  controllers: [StaffsController],
  providers: [StaffsService, FirebaseAdmin],
  exports: [StaffsService],
})
export class StaffsModule {}
