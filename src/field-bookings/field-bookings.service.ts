import { BadRequestException, Injectable } from '@nestjs/common';
import {
  FieldBookingsEntity,
  FieldBookingStatus,
} from '../entities/field-bookings.entity';
import { SportFieldsEntity } from '../entities/sport-fields.entity';
import { TimeSlotsEntity } from '../entities/time-slots.entity';
import { UsersEntity } from '../entities/users.entity';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateBookingDto } from './dto/create-booking-field.dto';
import { GetBookingHistoryDto } from './dto/get-booking-history.dto';
import {
  formatToVietnamTime,
  getCurrentTimeInUTC7,
  getTimeDiff,
  isInServiceTime,
} from '../utils/helper/date-time.helper';
import { GetPersonalBookingHistoryDto } from './dto/get-personal-booking-history.dto';
import { CheckBookingDto } from './dto/check-booking.dto';
import { STAFF_ROLE } from '../entities/staffs.entity';
import { VouchersService } from '../vouchers/vouchers.service';
import { PaymentService } from '../payment/payment.service';
import constants from '../config/constants';
import { PayNowDto } from './dto/pay-now.dto';

export interface BookingDataInterface {
  id: number;
  code: string;
  userId: number;
  sportFieldId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  originPrice: number;
  discountAmount: number;
  voucherCode?: string;
}

@Injectable()
export class FieldBookingsService {
  constructor(
    @InjectRepository(FieldBookingsEntity)
    private fieldBookingRepo: Repository<FieldBookingsEntity>,
    @InjectRepository(SportFieldsEntity)
    private sportFieldRepo: Repository<SportFieldsEntity>,
    @InjectRepository(TimeSlotsEntity)
    private timeSlotRepo: Repository<TimeSlotsEntity>,
    @InjectRepository(UsersEntity)
    private userRepo: Repository<UsersEntity>,
    private userService: UsersService,
    private voucherService: VouchersService,
    private paymentService: PaymentService,
  ) { }

  async getBookingHistory(
    dto: GetBookingHistoryDto,
    role: STAFF_ROLE,
    branchIds: string[],
  ) {
    const {
      fromDate,
      toDate,
      startTime,
      endTime,
      sportCategoryId,
      branchId,
      userId,
      status,
      limit,
      offset,
      search,
    } = dto;

    const query = this.getBookingQuery();
    if (userId) {
      query.andWhere('fb.user_id = :userId', { userId });
    }
    if (fromDate) {
      query.andWhere('fb.booking_date >= :fromDate', { fromDate });
    }
    if (toDate) {
      query.andWhere('fb.booking_date <= :toDate', { toDate });
    }
    if (startTime) {
      query.andWhere('fb.start_time >= :startTime', { startTime });
    }
    if (endTime) {
      query.andWhere('fb.end_time <= :endTime', { endTime });
    }
    if (sportCategoryId) {
      query.andWhere('sc.id = :sportCategoryId', { sportCategoryId });
    }
    if (branchId) {
      query.andWhere('sf.branch_id = :branchId', { branchId });
    }
    if (status) {
      query.andWhere('fb.status = :status', { status });
    }
    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('u.email LIKE :search', { search: `%${search}%` })
            .orWhere('u.phone_number LIKE :search', { search: `%${search}%` })
            .orWhere('fb.code LIKE :search', { search: `%${search}%` });
        }),
      );
    }
    if (role !== STAFF_ROLE.ADMIN) {
      query.andWhere('br.id IN (:...branchIds)', {
        branchIds: branchIds.map(Number),
      });
    }
    query
      .orderBy('fb.booking_date', 'DESC')
      .addOrderBy('fb.start_time', 'DESC');

    const total = await query.getCount();
    const data = await query
      .select([
        'fb.id "id"',
        'fb.code "code"',
        'fb.userId "userId"',
        'fb.sportFieldId "sportFieldId"',
        `TO_CHAR(fb.bookingDate, 'YYYY-MM-DD') "bookingDate"`,
        'fb.startTime "startTime"',
        'fb.endTime "endTime"',
        'fb.status "status"',
        'fb.totalPrice "totalPrice"',
        'fb.originPrice "originPrice"',
        'fb.discountAmount "discountAmount"',
        'fb.voucherCode "voucherCode"',
        'fb.createdAt "createdAt"',
        'fb.updatedAt "updatedAt"',
        'u.email  "userEmail"',
        'u.phoneNumber "phoneNumber"',
        'fb.sentMail "sentMail"',
        'fb.totalRetrySendMail "totalRetrySendMail"',
        'br.id  "branchId"',
        'br.name "branchName"',
        'sf.name "sportFieldName"',
        'sc.id "sportCategoryId"',
        'sc.name "sportCategoryName"',
      ])
      .limit(limit)
      .offset(offset)
      .getRawMany();

    return { data: data, count: total, limit: limit, offset };
  }

  async getPersonalBookingHistory(
    uid: string,
    dto: GetPersonalBookingHistoryDto,
  ) {
    const minRefundTime = constants.refund.minRefundTime;
    const query = this.getBookingQuery()
      .leftJoin('reviews', 'rv', 'rv.fieldBookingId = fb.id')
      .leftJoin('refunds', 'rf', 'rf.fieldBookingId = fb.id');
    query
      .where('u.uid = :uid', { uid })
      .andWhere('fb.status NOT IN (:...status)', {
        status: [FieldBookingStatus.CANCELLED],
      });

    const { bookingDate, startTime, endTime, sportCategoryId } = dto;

    if (bookingDate) {
      query.andWhere('fb.booking_date = :bookingDate', { bookingDate });
    }
    if (startTime) {
      query.andWhere('fb.start_time >= :startTime', { startTime });
    }
    if (endTime) {
      query.andWhere('fb.end_time <= :endTime', { endTime });
    }
    if (sportCategoryId) {
      query.andWhere('sc.id = :sportCategoryId', { sportCategoryId });
    }
    query
      .select([
        'fb.id "id"',
        'fb.code "code"',
        'fb.userId "userId"',
        'fb.sportFieldId "sportFieldId"',
        `TO_CHAR(fb.bookingDate, 'YYYY-MM-DD') "bookingDate"`,
        'fb.startTime "startTime"',
        'fb.endTime "endTime"',
        'fb.status "status"',
        'fb.totalPrice "totalPrice"',
        'fb.originPrice "originPrice"',
        'fb.discountAmount "discountAmount"',
        'fb.voucherCode "voucherCode"',
        'fb.latestPaymentDate "latestPaymentDate"',
        'fb.createdAt "createdAt"',
        'fb.updatedAt "updatedAt"',
        'u.email  "userEmail"',
        'u.phoneNumber "phoneNumber"',
        'br.id  "branchId"',
        'br.name "branchName"',
        'sf.name "sportFieldName"',
        'sc.id "sportCategoryId"',
        'sc.name "sportCategoryName"',
        'rv.id "reviewId"',
        'rv.comment "reviewComment"',
        'rv.rating "reviewRating"',
        'rv.createdAt "reviewCreatedAt"',
        'rv.updatedAt "reviewUpdatedAt"',
        'rf.id "refundId"',
      ])
      .orderBy('fb.booking_date', 'DESC')
      .addOrderBy('fb.start_time', 'DESC')
      .limit(dto.limit)
      .offset(dto.offset);
    const [data, count] = await Promise.all([
      query.getRawMany(),
      query.getCount(),
    ]);
    const dateToCalDiff = new Date().toISOString();
    // must paid and not refund request
    // in time to refund;
    const items = data.map((item) => ({
      ...item,
      canRequestRefund:
        !item.refundId &&
        item.status === FieldBookingStatus.PAID &&
        this.getDiffTimeInHours(
          item.bookingDate,
          item.startTime,
          dateToCalDiff,
        ) < minRefundTime,
    }));
    return { items, count };
  }

  async createFieldBooking(dto: CreateBookingDto) {
    let user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      user = await this.userService.create({ email: dto.email });
    }
    const selectedDate = new Date(dto.bookingDate + ' ' + dto.startTime);
    const currentTime = getCurrentTimeInUTC7();
    if (selectedDate < new Date(currentTime)) {
      throw new BadRequestException('Invalid booking time');
    }

    const field = await this.sportFieldRepo.findOne({
      where: { id: dto.sportFieldId, isActive: true },
      relations: {
        branch: true,
      },
    });

    if (!field) {
      throw new BadRequestException('Sport field is not exist');
    }

    //validate time slot in service time
    if (
      !isInServiceTime(
        field.branch.openTime,
        field.branch.closeTime,
        dto.startTime,
        dto.endTime,
      )
    ) {
      throw new BadRequestException('Time booking is out of service time');
    }
    // validate time slot is available
    // todo
    // validate voucher
    if (dto.voucherCode) {
      const validVoucher = await this.voucherService.checkActive(
        dto.voucherCode,
      );
      if (!validVoucher) {
        throw new BadRequestException('Voucher code is not valid');
      }
    }
    const bookedField = await this.fieldBookingRepo
      .createQueryBuilder('booking')
      .where('booking.bookingDate = :bookingDate', {
        bookingDate: dto.bookingDate,
      })
      .andWhere('booking.status NOT IN (:...status)', {
        status: [FieldBookingStatus.CANCELLED, FieldBookingStatus.REFUND],
      })
      .andWhere('booking.sportFieldId = :sportFieldId', {
        sportFieldId: dto.sportFieldId,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where(
            new Brackets((ib) => {
              ib.where('booking.startTime < :startTime', {
                startTime: dto.startTime,
              }).andWhere('booking.endTime > :startTime', {
                startTime: dto.startTime,
              });
            }),
          )
            .orWhere(
              new Brackets((ib) => {
                ib.where('booking.startTime < :endTime', {
                  endTime: dto.endTime,
                }).andWhere('booking.endTime > :endTime', {
                  endTime: dto.endTime,
                });
              }),
            )
            .orWhere(
              new Brackets((ib) => {
                ib.where('booking.startTime <= :startTime', {
                  startTime: dto.startTime,
                }).andWhere('booking.endTime >= :endTime', {
                  endTime: dto.endTime,
                });
              }),
            )
            .orWhere(
              new Brackets((ib) => {
                ib.where('booking.startTime >= :startTime', {
                  startTime: dto.startTime,
                }).andWhere('booking.endTime <= :endTime', {
                  endTime: dto.endTime,
                });
              }),
            );
        }),
      )
      .getOne();

    if (bookedField) {
      throw new BadRequestException('Field is unavailable to booking!');
    }
    // create fieldBooking
    const newBooking = this.fieldBookingRepo.create({
      ...dto,
      userId: user.id,
      code: this.generateBookingCode(),
      status: FieldBookingStatus.PENDING,
    });

    await Promise.all([
      this.fieldBookingRepo.save(newBooking),
      this.voucherService.usedVoucher(dto.voucherCode),
    ]);
    // call to payment service
    let paymentResponse = undefined;
    try {
      paymentResponse = await this.paymentService.createZaloPayOrder(
        [newBooking] as BookingDataInterface[],
        newBooking.totalPrice,
      );
    } catch (error) {
      console.error('Error creating ZaloPay order:', error);
      //cancel bookings
      await this.fieldBookingRepo.update(
        { code: newBooking.code },
        { status: FieldBookingStatus.CANCELLED },
      );
      throw new BadRequestException('Error happening when creating payment');
    }

    return paymentResponse;
  }

  async payNow(dto: PayNowDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new BadRequestException(
        'Có lỗi xảy ra trong quá trình thanh toán, vui lòng thử lại sau',
      );
    }

    // check if booking is exist and pending
    const pendingBookedField = await this.fieldBookingRepo.findOne({
      where: {
        code: dto.bookingCode,
        status: FieldBookingStatus.PENDING,
        sportFieldId: dto.sportFieldId,
        userId: user.id,
        bookingDate: dto.bookingDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });

    // update booking price
    if (!pendingBookedField) {
      throw new BadRequestException(
        'Có lỗi xảy ra trong quá trình thanh toán, vui lòng thử lại sau',
      );
    }

    // validate time voucher and new price is correct
    await this.fieldBookingRepo.update(
      { id: pendingBookedField.id },
      {
        totalPrice: dto.totalPrice,
        originPrice: dto.originPrice,
        discountAmount: dto.discountAmount,
        voucherCode: dto.voucherCode,
      },
    );
    // check if payment is already created
    const existingPayment = await this.paymentService.getPaymentByBookingId(
      pendingBookedField.id,
    );

    let paymentResponse = undefined;
    if (existingPayment) {
      paymentResponse = {
        order_url: existingPayment.orderUrl,
      };
      return paymentResponse;
    }
    const bookingData: BookingDataInterface = {
      id: pendingBookedField.id,
      code: pendingBookedField.code,
      userId: pendingBookedField.userId,
      sportFieldId: pendingBookedField.sportFieldId,
      bookingDate: pendingBookedField.bookingDate,
      startTime: pendingBookedField.startTime,
      endTime: pendingBookedField.endTime,
      totalPrice: dto.totalPrice,
      originPrice: dto.originPrice,
      discountAmount: dto.discountAmount,
      voucherCode: dto.voucherCode,
    };
    try {
      paymentResponse = await this.paymentService.createZaloPayOrder(
        [bookingData] as BookingDataInterface[],
        bookingData.totalPrice,
      );
    } catch (error) {
      console.error('Error creating ZaloPay order:', error);
      //cancel bookings
      await this.fieldBookingRepo.update(
        { code: bookingData.code },
        { status: FieldBookingStatus.CANCELLED },
      );
      throw new BadRequestException('Error happening when creating payment');
    }

    return paymentResponse;
  }

  async checkBooking(dto: CheckBookingDto) {
    const { email, bookingDate, startTime, endTime, sportCategoryId, limit } =
      dto;

    const query = this.getBookingQuery();
    query
      .where('u.email LIKE :email', { email: `%${email}%` })
      .andWhere('fb.status = :status', { status: FieldBookingStatus.PAID });

    if (bookingDate) {
      query.andWhere('fb.booking_date = :bookingDate', { bookingDate });
    }
    if (startTime) {
      query.andWhere('fb.start_time >= :startTime', { startTime });
    }
    if (endTime) {
      query.andWhere('fb.end_time <= :endTime', { endTime });
    }
    if (sportCategoryId) {
      query.andWhere('sc.id = :sportCategoryId', { sportCategoryId });
    }

    query
      .select([
        'fb.id "id"',
        'fb.code "code"',
        'fb.userId "userId"',
        'fb.sportFieldId "sportFieldId"',
        'fb.bookingDate "bookingDate"',
        'fb.startTime "startTime"',
        'fb.endTime "endTime"',
        'fb.status "status"',
        'fb.totalPrice "totalPrice"',
        'fb.createdAt "createdAt"',
        'fb.updatedAt "updatedAt"',
        'u.email  "userEmail"',
        'u.phoneNumber "phoneNumber"',
        'br.id  "branchId"',
        'br.name "branchName"',
        'sf.name "sportFieldName"',
        'sc.id "sportCategoryId"',
        'sc.name "sportCategoryName"',
      ])
      .limit(limit)
      .orderBy('fb.booking_date', 'DESC')
      .addOrderBy('fb.start_time', 'DESC');

    return await query.getRawMany();
  }

  // async extendTimeBooking(dto: GetBookingHistoryDto) {
  //   //to do: accept booking 30 more => searh availble time with gap 30 accepted
  // }

  // async createMultiBookingField(dto: GetBookingHistoryDto) {
  //   //to do: create for one month - or 3 week with same time
  //   /**
  //    * separate booking : can refund request if need
  //    *  -- pay in current week
  //    *  -- schedule payment before 4 day this timeSlot
  //    */
  // }

  async checkBookingCode(req: any, code: string) {
    const now = new Date().toISOString();
    const currentTime = formatToVietnamTime(now, 'YYYY-MM-DD HH:mm:ss');
    const staff = req.staff;
    let query = this.getBookingQuery();

    if (staff.role !== STAFF_ROLE.ADMIN) {
      console.log('staff role', staff);
      query = query.where('br.id = :branchId', {
        branchId: staff.branchids?.map(Number),
      });
    }
    const booking = await query
      .where('fb.code = :code', { code })
      .andWhere('fb.status IN (:...status)', {
        status: [FieldBookingStatus.PAID, FieldBookingStatus.CHECK_IN],
      })
      .select([
        'fb.id "id"',
        'fb.code "code"',
        'fb.userId "userId"',
        'fb.sportFieldId "sportFieldId"',
        'sf.name "sportFieldName"',
        `TO_CHAR(fb.bookingDate, 'YYYY-MM-DD') "bookingDate"`,
        'fb.status "status"',
        'fb.startTime "startTime"',
        'fb.endTime "endTime"',
        'fb.status "status"',
        'u.email  "userEmail"',
        'u.phoneNumber "phoneNumber"',
        'fb.updatedAt "updatedAt"',
      ])
      .getRawOne();

    if (!booking) {
      throw new BadRequestException('Booking code is not valid');
    }
    // checking valid is before max 30 minutes
    // and after 30 minutes
    const bookingStart = booking.bookingDate + ' ' + booking.startTime + ':00';
    const bookingEnd = booking.bookingDate + ' ' + booking.endTime + ':00';

    const diffStartTime = getTimeDiff(currentTime, bookingStart, 'minute');
    const diffEndTime = getTimeDiff(currentTime, bookingEnd, 'minute');

    if (diffStartTime < -30) {
      throw new BadRequestException(
        'Chưa đến thời gian check in sân, vui lòng quay lại sau',
      );
    }
    if (diffEndTime > 30) {
      throw new BadRequestException(
        'Thời gian check in sân đã hết, vui lòng liên hệ với quản lý',
      );
    }
    // return booking if already check in and not update
    if (booking.status === FieldBookingStatus.CHECK_IN) {
      return booking;
    }

    await this.fieldBookingRepo.update(
      { code: booking.code },
      { status: FieldBookingStatus.CHECK_IN, checkInBy: staff.email },
    );
    return booking;
  }
  generateBookingCode(): string {
    return 'OTP-' + uuidv4().split('-')[0].toUpperCase();
  }

  getBookingQuery() {
    return this.fieldBookingRepo
      .createQueryBuilder('fb')
      .innerJoin('users', 'u', 'u.id = fb.user_id')
      .innerJoin('sport_fields', 'sf', 'sf.id = fb.sport_field_id')
      .innerJoin('branches', 'br', 'br.id = sf.branch_id')
      .innerJoin('sport_categories', 'sc', 'sc.id = sf.sport_category_id');
  }

  getDiffTimeInHours = (
    bookingDate: string,
    startTime: string,
    dateToCalDiff: string,
  ) => {
    const bookingDateTime = bookingDate + ' ' + startTime + ':00';
    const hoursDifference = getTimeDiff(dateToCalDiff, bookingDateTime, 'hour');
    return hoursDifference;
  };
}
