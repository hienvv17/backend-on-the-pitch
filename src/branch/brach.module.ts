import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchEntity } from '../entities/branch.entity';
import { ResponseModule } from '../response/response.module';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffModule } from 'src/staff/staff.module';

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
