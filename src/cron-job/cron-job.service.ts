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
import { Between, In, LessThan, Repository } from 'typeorm';
import { generateVoucherCode } from '../utils/helper/voucher-generate';
import {
  FieldBookingsEntity,
  FieldBookingStatus,
} from '../entities/field-bookings.entity';
import { PaymentsEntity, PaymentStatus } from '../entities/payment.entity';

@Injectable()
export class CronJobService {
  constructor(
    @InjectRepository(VouchersEntity)
    private voucherRepo: Repository<VouchersEntity>,
    @InjectRepository(VoucherConfig)
    private voucherConfigRepo: Repository<VoucherConfig>,
    @InjectRepository(UsersEntity)
    private usersRepo: Repository<UsersEntity>,
    @InjectRepository(FieldBookingsEntity)
    private fieldBookingRepo: Repository<FieldBookingsEntity>,
    @InjectRepository(PaymentsEntity)
    private paymentRepo: Repository<PaymentsEntity>,
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
            const voucherCode = generateVoucherCode(
              birthDateConfig.voucherCode,
            );
            await this.voucherRepo.save({
              userId: user.id,
              type: VoucherType.BIRTHDAY,
              code: voucherCode,
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

    // // Email to user have voucher expired today
    // const todayVouchers = await this.voucherRepo
    //   .createQueryBuilder('voucher')
    //   .innerJoin('users', 'user', 'user.id = voucher.userId')
    //   .where('voucher.validTo = :today', {
    //     today: new Date(currentYear, month - 1, _date),
    //   })
    //   .andWhere('voucher.status = :status', {
    //     status: VoucherStatus.ACTIVE,
    //   })
    //   .select([
    //     'user.id "userId"',
    //     `count(*) "voucherCount"`,
    //     'user.email "email"',
    //     'user.fullName "fullName"',
    //   ])
    //   .groupBy('user.id')
    //   .getMany();
    // reduce to get total number of vouchers  expire to day to users to send email
    // if (todayVouchers.length > 0) {
    //   const userIds = todayVouchers.map((voucher) => voucher.userId);

    // email to user have booking must be paid today
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

  @Cron('*/10 * * * *')
  async handleEveryTenMinCron() {
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // Step 1: Get field bookings with PENDING status older than 15 mins, ignore those with latestPaymentDate > today
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const expiredBookings = await this.fieldBookingRepo
      .createQueryBuilder('booking')
      .leftJoin('payments', 'p', 'p.field_booking_id = booking.id')
      .where('booking.status = :status', { status: FieldBookingStatus.PENDING })
      .andWhere('booking.created_at < :fifteenMinutesAgo', {
        fifteenMinutesAgo,
      })
      .andWhere('p.status = :paymentStatus', { paymentStatus: 'PENDING' })
      .andWhere(
        '(booking.latestPaymentDate IS NULL OR booking.latestPaymentDate < :today)',
        {
          today,
        },
      )
      .select([
        'booking.id "bookingId"',
        'p.id AS payment_id',
        'booking.voucher_code "voucherCode"',
      ])
      .getRawMany();

    if (expiredBookings.length != 0) {
      const bookingIds = expiredBookings.map((booking) => booking.bookingId);
      const paymentIds = expiredBookings.map((booking) => booking.payment_id);
      const voucherCodes = expiredBookings.map(
        (booking) => booking.voucherCode,
      );

      await Promise.all([
        this.fieldBookingRepo.update(
          { id: In(bookingIds) },
          { status: FieldBookingStatus.CANCELLED },
        ),
        this.paymentRepo.update(
          { id: In(paymentIds) },
          { status: PaymentStatus.CANCELLED },
        ),
        this.voucherRepo.update(
          { code: In(voucherCodes) },
          { status: VoucherStatus.ACTIVE }, // or 'CANCELLED', depending on your logic
        ),
      ]);
    }
    console.log(
      `[Cron] Cancelled ${
        expiredBookings.length
      } expired bookings at ${now.toISOString()}`,
    );
  }
}
