import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { BranchEntity } from '@src/entities/branch.entity';
import { ResponseModule } from '@src/response/response.module';
import { StaffModule } from '@src/staff/staff.module';
import { FirebaseAdmin } from '@src/firebase/firebase.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BranchEntity]),
    ResponseModule,
    StaffModule,
  ],
  controllers: [BranchController],
  providers: [BranchService, FirebaseAdmin],
  exports: [BranchService],
})
export class BranchModule {}
