import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../entities/users.entity';
import { ResponseModule } from '../response/response.module';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffsModule } from '../staffs/staffs.module';
import { VouchersEntity } from '../entities/vouchers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity,VouchersEntity]),
    ResponseModule,
    StaffsModule,
  ],
  controllers: [UserController],
  providers: [UsersService, FirebaseAdmin],
  exports: [UsersService],
})
export class UsersModule { }
