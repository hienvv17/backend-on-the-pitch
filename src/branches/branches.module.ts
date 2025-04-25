import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchsEntity } from '../entities/branches.entity';
import { ResponseModule } from '../response/response.module';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffsModule } from '../staffs/staffs.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BranchsEntity]),
    ResponseModule,
    StaffsModule,
    CacheModule,
  ],
  controllers: [BranchesController],
  providers: [BranchesService, FirebaseAdmin],
  exports: [BranchesService],
})
export class BranchesModule {}
