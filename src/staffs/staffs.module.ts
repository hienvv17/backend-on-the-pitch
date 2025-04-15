import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffsController } from './staffs.controller';
import { StaffsService } from './staffs.service';
import { StaffsEntity } from '../entities/staffs.entity';
import { ResponseModule } from '../response/response.module';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffBranchEntity } from '../entities/staff_branch.entity';
import { BranchsEntity } from '../entities/branchs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaffsEntity, StaffBranchEntity, BranchsEntity]),
    ResponseModule,
  ],
  controllers: [StaffsController],
  providers: [StaffsService, FirebaseAdmin],
  exports: [StaffsService],
})
export class StaffsModule {}
