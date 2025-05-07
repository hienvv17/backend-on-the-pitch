import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { VouchersEntity } from '../entities/vouchers.entity';
import { VoucherConfig } from '../entities/voucher-config.entity';
import { StaffsModule } from '../staffs/staffs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VouchersEntity, VoucherConfig]),
    StaffsModule,
  ],
  controllers: [VouchersController],
  providers: [VouchersService, FirebaseAdmin],
  exports: [VouchersService],
})
export class VouchersModule {}
