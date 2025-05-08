import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  VouchersEntity,
  VoucherStatus,
  VoucherType,
} from '../entities/vouchers.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '../entities/users.entity';
import { VoucherConfig } from '../entities/voucher-config.entity';
import { Between, LessThan, Repository } from 'typeorm';
import { generateVoucherCode } from '../utils/helper/voucher-generate';

@Injectable()
export class CronJobService {
  constructor(
    @InjectRepository(VouchersEntity)
    private voucherRepo: Repository<VouchersEntity>,
    @InjectRepository(VoucherConfig)
    private voucherConfigRepo: Repository<VoucherConfig>,
    @InjectRepository(UsersEntity)
    private usersRepo: Repository<UsersEntity>,
  ) {}
  // Cron job that runs every day at 3 AM
  //test
  @Cron('0 7 * * *')
  async handleDailyCron() {
    const birthDateConfig = await this.voucherConfigRepo.findOne({
      where: { type: VoucherType.BIRTHDAY, isActive: true },
    });
    const currentDate = new Date();
    const _date = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    // gen voucher for birthday
    if (birthDateConfig) {
      const users = await this.usersRepo.find({
        where: { date: _date, month: month },
      });
      if (users.length > 0) {
        for (const user of users) {
          const existingVoucher = await this.voucherRepo.findOne({
            where: {
              userId: user.id,
              type: VoucherType.BIRTHDAY,
              createdAt: Between(
                new Date(currentYear, 0, 1),
                new Date(currentYear, 11, 31, 23, 59, 59),
              ),
            },
          });
          if (!existingVoucher) {
            const now = new Date(currentYear, month - 1, _date);
            const validTo = new Date(currentYear, month - 1, _date);
            validTo.setDate(now.getDate() + birthDateConfig.validDays);
            await this.voucherRepo.save({
              userId: user.id,
              type: VoucherType.BIRTHDAY,
              code: birthDateConfig.voucherCode,
              percentDiscount: birthDateConfig.percentDiscount,
              maxDiscountAmount: birthDateConfig.maxDiscountAmount,
              validFrom: now,
              validTo,
              status: VoucherStatus.ACTIVE,
            });
          }
        }
      }
    }
    // disable expired vouchers
    const expiredVouchers = await this.voucherRepo.find({
      where: {
        validTo: LessThan(new Date(currentYear, month - 1, _date)),
        status: VoucherStatus.ACTIVE,
      },
    });

    if (expiredVouchers.length > 0) {
      for (const voucher of expiredVouchers) {
        voucher.status = VoucherStatus.EXPIRED;
        await this.voucherRepo.save(voucher);
      }
    }
  }

  // Cron job that runs on the first day of every month at 4 PM
  @Cron('0 16 1 * *')
  async handleMonthlyCron() {
    // Generate loyalty vouchers for users who have made 4 reviews within the last 30 days on bookings paid
    const currentDate = new Date();
    const _date = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const loyaltyVoucherConfig = await this.voucherConfigRepo.findOne({
      where: { type: VoucherType.LOYALTY, isActive: true },
    });
    if (loyaltyVoucherConfig) {
      const users = await this.usersRepo
        .createQueryBuilder('user')
        .leftJoin('field_bookings', 'b', 'b.user_id = user.id')
        .where('b.status = :status', { status: 'PAID' })
        .andWhere('b.booking_date >= :startDateOfMonth', {
          startDateOfMonth: new Date(
            new Date().getFullYear(),
            new Date().getMonth() - 1,
            1,
          ),
        })
        .andWhere('b.booking_date <= :endDateOfMonth', {
          endDateOfMonth: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            0,
          ),
        })
        .groupBy('user.id')
        .having('SUM(b.total_amount) >= :amount', {
          amount: loyaltyVoucherConfig.amountToTrigger,
        })
        .select('user.id', 'id')
        .addSelect('user.name', 'name')
        .addSelect('user.email', 'email')
        .getMany();

      const monthStart = new Date(currentYear, month - 1, 1);
      const monthEnd = new Date(currentYear, month, 0);
      if (users.length > 0) {
        await Promise.all(
          users.map(async (user) => {
            const existingVoucher = await this.voucherRepo.findOne({
              where: {
                userId: user.id,
                type: VoucherType.LOYALTY,
                createdAt: Between(monthStart, monthEnd),
              },
            });

            if (!existingVoucher) {
              const voucherCode = generateVoucherCode(
                loyaltyVoucherConfig.voucherCode,
              );

              const now = new Date(currentYear, month - 1, _date);
              const validTo = new Date(now);
              validTo.setDate(now.getDate() + loyaltyVoucherConfig.validDays);

              await this.voucherRepo.save({
                userId: user.id,
                type: VoucherType.LOYALTY,
                code: voucherCode,
                percentDiscount: loyaltyVoucherConfig.percentDiscount,
                maxDiscountAmount: loyaltyVoucherConfig.maxDiscountAmount,
                validFrom: now,
                validTo,
                status: VoucherStatus.ACTIVE,
              });
            }
          }),
        );
      }
    }
    // Generate loyalty vouchers for users who have made total amount bookings last month
  }

  // @Cron('0 3 5 * * ')
  // async handleMonthlyCronAt5th() {
  //   // Generate review vouchers for users who have made 4 reviews within the last 30 days on bookings paid
  //   const currentDate = new Date();
  //   const _date = currentDate.getDate();
  //   const month = currentDate.getMonth() + 1;
  //   const currentYear = currentDate.getFullYear();
  //   const reviewVoucherConfig = await this.voucherConfigRepo.findOne({
  //     where: { type: VoucherType.REVIEW, isActive: true },
  //   });
  //   if (reviewVoucherConfig) {
  //     const users = await this.usersRepo
  //       .createQueryBuilder('user')
  //       .leftJoin('field_bookings', 'b', 'b.user_id = user.id')
  //       .where('b.status = :status', { status: 'PAID' })
  //       .andWhere('b.booking_date >= :startDateOfMonth', {
  //         startDateOfMonth: new Date(
  //           new Date().getFullYear(),
  //           new Date().getMonth() - 1,
  //           1,
  //         ),
  //       })
  //       .andWhere('b.booking_date <= :endDateOfMonth', {
  //         endDateOfMonth: new Date(
  //           new Date().getFullYear(),
  //           new Date().getMonth(),
  //           0,
  //         ),
  //       })
  //       .groupBy('user.id')
  //       .having('SUM(b.total_amount) >= :amount', {
  //         amount: reviewVoucherConfig.amountToTrigger,
  //       })
  //       .select('user.id', 'id')
  //       .addSelect('user.name', 'name')
  //       .addSelect('user.email', 'email')
  //       .getMany();

  //     const monthStart = new Date(currentYear, month - 1, 1);
  //     const monthEnd = new Date(currentYear, month, 0);
  //     if (users.length > 0) {
  //       await Promise.all(
  //         users.map(async (user) => {
  //           const existingVoucher = await this.voucherRepo.findOne({
  //             where: {
  //               userId: user.id,
  //               type: VoucherType.LOYALTY,
  //               createdAt: Between(monthStart, monthEnd),
  //             },
  //           });

  //           if (!existingVoucher) {
  //             const voucherCode = generateVoucherCode(
  //               reviewVoucherConfig.voucherCode,
  //             );

  //             const now = new Date(currentYear, month - 1, _date);
  //             const validTo = new Date(now);
  //             validTo.setDate(now.getDate() + reviewVoucherConfig.validDays);

  //             await this.voucherRepo.save({
  //               userId: user.id,
  //               type: VoucherType.LOYALTY,
  //               code: voucherCode,
  //               percentDiscount: reviewVoucherConfig.percentDiscount,
  //               maxDiscountAmount: reviewVoucherConfig.maxDiscountAmount,
  //               validFrom: now,
  //               validTo,
  //               status: VoucherStatus.ACTIVE,
  //             });
  //           }
  //         }),
  //       );
  //     }
  //   }
  //   // Generate loyalty vouchers for users who have made total amount bookings last month
  // }
}
