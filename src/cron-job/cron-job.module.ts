import { Module } from '@nestjs/common';
import { CronJobService } from './cron-job.service';
import { UsersService } from '../users/users.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../entities/users.entity';
import { VouchersEntity } from '../entities/vouchers.entity';
import { VoucherConfig } from '../entities/voucher-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity, VouchersEntity, VoucherConfig]),
  ],
  providers: [CronJobService],
})
export class CronJobModule {}
