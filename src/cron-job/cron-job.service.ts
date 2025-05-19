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
import constants from '../config/constants';
import { BookingMailService } from '../mail/mail.service';
import { RefundsEntity, RefundStatus } from '../entities/refund.entity';
import { PaymentService } from '../payment/payment.service';
import { RefundsService } from '../refunds/refunds.service';

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
    @InjectRepository(RefundsEntity)
    private refundsRepo: Repository<RefundsEntity>,
    private readonly mailService: BookingMailService,
    private readonly paymentService: PaymentService,
    private readonly refundService: RefundsService,
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

  @Cron('*/1 * * * *')
  async handleEveryTenMinCron() {
    console.log('Start cron job every 10 minutes');
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // Step 1: Get field bookings with PENDING status older than 15 mins, ignore those with latestPaymentDate > today
    const today = new Date();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 59);
    const expiredBookings = await this.fieldBookingRepo
      .createQueryBuilder('booking')
      .leftJoin('payments', 'p', 'p.field_booking_id = booking.id')
      .where('booking.status = :status', { status: FieldBookingStatus.PENDING })
      .andWhere('booking.created_at < :fifteenMinutesAgo', {
        fifteenMinutesAgo,
      })
      .andWhere('p.status = :paymentStatus', {
        paymentStatus: PaymentStatus.PENDING,
      })
      .andWhere(
        `booking.latestPaymentDate < 
      CAST(
        CASE 
          WHEN p.id IS NOT NULL THEN :today
          ELSE :endOfToday
        END
      AS TIMESTAMP)`,
        {
          today,
          endOfToday,
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

    // Resend email to user if the booking PAID but not sent mail
    const failedResendMailList = [];
    const maxRetry = constants.email.maxRetry;
    const resendMailList = await this.fieldBookingRepo
      .createQueryBuilder('booking')
      .leftJoin('users', 'user', 'user.id = booking.user_id')
      .leftJoin('sport_fields', 'sf', 'sf.id = booking.sport_field_id')
      .leftJoin('branches', 'br', 'br.id = sf.branch_id')
      .where('booking.status = :status', { status: FieldBookingStatus.PAID })
      .andWhere('booking.sent_mail = :sentMail', { sentMail: false })
      .andWhere('booking.total_retry_send_mail < :maxRetry', {
        maxRetry,
      })
      .select([
        'booking.id "bookingId"',
        'booking.code "bookingCode"',
        'user.fullName "customerName"',
        'user.fullName "customerName"',
        'user.email "customerEmail"',
        'sf.name "fieldName"',
        'br.name "branchName"',
        `TO_CHAR(booking.bookingDate, 'YYYY-MM-DD') "bookingDate"`,
        'booking.start_time "startTime"',
        'booking.end_time "endTime"',
        'booking.total_price "totalPrice"',
        'booking.origin_price "originPrice"',
        'booking.discount_amount "discountAmount"',
        'booking.voucher_code "voucherCode"',
        'booking.sent_mail "sentMail"',
        'booking.total_retry_send_mail "totalRetrySendMail"',
      ])
      .getRawMany();
    if (resendMailList.length > 0) {
      await Promise.all(
        resendMailList.map(async (booking) => {
          try {
            await this.mailService.sendBookingSuccessEmail(
              booking.customerEmail,
              {
                ...booking,
                discountAmount: booking.discountAmount ?? 0,
                voucherCode: booking.voucherCode ?? '',
              },
            );
          } catch (error) {
            failedResendMailList.push(booking);
          }
        }),
      );
    }

    if (failedResendMailList.length > 0) {
      await Promise.all(
        failedResendMailList.map(
          async (booking) =>
            await this.fieldBookingRepo.update(
              { id: booking.bookingId },
              {
                sentMail: false,
                totalRetrySendMail: Number(booking.totalRetrySendMail) + 1,
              },
            ),
        ),
      );
    }
    // sucess retry List
    const successResendMailList = resendMailList.filter(
      (booking) =>
        !failedResendMailList.some(
          (failedBooking) => failedBooking.bookingId === booking.bookingId,
        ),
    );

    if (successResendMailList.length > 0) {
      await Promise.all(
        successResendMailList.map(
          async (booking) =>
            await this.fieldBookingRepo.update(
              { id: booking.bookingId },
              {
                sentMail: true,
                totalRetrySendMail: Number(booking.totalRetrySendMail) + 1,
              },
            ),
        ),
      );
    }
    // check refund if is processing update status
    const processRefundList = await this.refundsRepo.find({
      where: {
        status: RefundStatus.PROCESSING,
      },
    });

    if (processRefundList.length > 0) {
      await Promise.allSettled(
        processRefundList.map((refund) => {
          this.refundService.updateRefundProcess(refund.id);
        }),
      );
    }

    console.log(
      `[Cron] Cancelled ${
        expiredBookings.length
      } expired bookings at ${now.toISOString()}`,
    );
  }
}
