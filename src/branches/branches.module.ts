import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchsEntity } from '../entities/branches.entity';
import { ResponseModule } from '../response/response.module';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffsModule } from '../staffs/staffs.module';
import { CacheService } from '../cache/cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BranchsEntity]),
    ResponseModule,
    StaffsModule,
  ],
  controllers: [BranchesController],
  providers: [BranchesService, FirebaseAdmin, CacheService],
  exports: [BranchesService],
})
export class BranchesModule {}
