import { Module } from '@nestjs/common';
import { CronJobService } from './cron-job.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../entities/users.entity';
import { VouchersEntity } from '../entities/vouchers.entity';
import { VoucherConfig } from '../entities/voucher-config.entity';
import { PaymentsEntity } from '../entities/payment.entity';
import { FieldBookingsEntity } from '../entities/field-bookings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      VouchersEntity,
      VoucherConfig,
      PaymentsEntity,
      FieldBookingsEntity,
    ]),
  ],
  providers: [CronJobService],
})
export class CronJobModule {}
