import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchsEntity } from '../entities/branchs.entity';
import { ResponseModule } from '../response/response.module';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffsModule } from 'src/staffs/staffs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BranchsEntity]),
    ResponseModule,
    StaffsModule,
  ],
  controllers: [BranchesController],
  providers: [BranchesService, FirebaseAdmin],
  exports: [BranchesService],
})
export class BranchesModule {}
