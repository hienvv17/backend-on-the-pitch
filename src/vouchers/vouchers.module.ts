import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { VouchersEntity } from '../entities/vouchers.entity';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffsModule } from '../staffs/staffs.module';
import { ResponseModule } from 'src/response/response.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VouchersEntity]),
    StaffsModule,
    ResponseModule,
  ],
  controllers: [VouchersController],
  providers: [VouchersService, FirebaseAdmin],
  exports: [VouchersService],
})
export class VouchersModule {}
