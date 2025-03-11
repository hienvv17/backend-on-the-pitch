import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { StaffEntity } from '@src/entities/staff.entity';
import { ResponseModule } from '@src/response/response.module';
import { FirebaseAdmin } from '@src/firebase/firebase.service';
import { StaffBranchEntity } from '@src/entities/staff-branch.entity';
import { BranchEntity } from '@src/entities/branch.entity';
// import { FirebaseAdmin } from '@src/firebase/firebase.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaffEntity, StaffBranchEntity, BranchEntity]),
    ResponseModule,
  ],
  controllers: [StaffController],
  providers: [StaffService, FirebaseAdmin],
  exports: [StaffService],
})
export class StaffModule {}
