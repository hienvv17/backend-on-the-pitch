import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefundsEntity, RefundStatus } from '../entities/refund.entity';
import { Repository } from 'typeorm';
import { CreateRefundDto } from './dto/create-refund-request.dto';
import {
  FieldBookingsEntity,
  FieldBookingStatus,
} from '../entities/field-bookings.entity';
import { UsersEntity } from '../entities/users.entity';
import {
  getCurrentTimeInUTC7,
  getTimeDiff,
} from '../utils/helper/date-time.helper';
import constants from '../config/constants';
import { UpdateRefundDto } from './dto/update-refund-request.dto';
import moment from 'moment-timezone';
import { ProcessRefundDto } from './dto/process-refund.dto';
import { PaymentStatus } from '../entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { BookingMailService } from '../mail/mail.service';
import { STAFF_ROLE } from 'src/entities/staffs.entity';

@Injectable()
export class RefundsService {
  constructor(
    @InjectRepository(RefundsEntity)
    private refundRepo: Repository<RefundsEntity>,
    @InjectRepository(FieldBookingsEntity)
    private fieldBookingRepo: Repository<FieldBookingsEntity>,
    @InjectRepository(UsersEntity)
    private usersRepo: Repository<UsersEntity>,
    private paymentService: PaymentService,
    private readonly mailService: BookingMailService,
  ) {}

  async create(uid: string, dto: CreateRefundDto) {
    // Check if the field booking exists with PAID status

    const minRefundTime = constants.refund.minRefundTime;
    const fieldBooking = await this.fieldBookingRepo
      .createQueryBuilder('fb')
      .innerJoin('users', 'u', 'u.id = fb.userId')
      .where('fb.id = :id', { id: dto.fieldBookingId })
      .andWhere('fb.status = :status', {
        status: FieldBookingStatus.PAID,
      })
      .andWhere('u.uid = :uid', { uid })
      .select([
        'fb.id "id:"',
        'fb.code "code"',
        'fb.status "status"',
        'u.uid "uid"',
        'u.id "userId"',
        'u.email "userEmail"',
        'fb.bookingDate "bookingDate"',
        'fb.startTime "startTime"',
        'fb.endTime "endTime"',
        'fb.totalPrice "totalPrice"',
      ])
      .getRawOne();
    if (!fieldBooking) {
      throw new BadRequestException('Yêu cầu hoàn tiền không hợp lệ.');
    }
    // Check if bookingDate is within refund time configuration
    // Combine the times
    const dateToCalDiff = new Date().toISOString();
    const difference = this.getDiffTimeInHours(
      fieldBooking.bookingDate,
      fieldBooking.startTime,
      dateToCalDiff,
    );
    if (difference > minRefundTime) {
      throw new BadRequestException(
        `Bạn chỉ có thể yêu cầu hoàn tiền trễ nhất sau ${minRefundTime} giờ so với thời gian đã đặt.`,
      );
    }
    // Check if a refund request already exists for this booking
    const existingRefund = await this.refundRepo.findOne({
      where: { fieldBookingId: dto.fieldBookingId },
    });
    if (existingRefund) {
      throw new BadRequestException(
        'Bạn đã gửi yêu cầu hoàn tiền một lần. Vui lòng chờ xử lý.',
      );
    }
    const refund = this.refundRepo.create({
      fieldBookingId: dto.fieldBookingId,
      reason: dto.reason,
      userId: fieldBooking.userId,
    });
    return await this.refundRepo.save(refund);
  }

  async findAll(
    req: any,
    limit: number,
    offset: number,
    order: string,
    sortKey?: string,
    status?: string,
    bracnhId?: number,
    search?: string,
  ) {
    const staff = req.staff;

    let query = this.refundRepo
      .createQueryBuilder('refund')
      .innerJoin(
        'field_bookings',
        'fieldBooking',
        'fieldBooking.id = refund.fieldBookingId',
      )
      .innerJoin('users', 'user', 'user.id = refund.userId')
      .innerJoin('sport_fields', 'sf', 'sf.id = fieldBooking.sportFieldId')
      .innerJoin('branches', 'br', 'br.id = sf.branchId')
      .select([
        'refund.id "id"',
        'refund.amount "amount"',
        'refund.reason "reason"',
        'refund.adminNote "adminNote"',
        'refund.status "status"',
        'fieldBooking.code "fieldBookingCode"',
        `TO_CHAR(fieldBooking.bookingDate, 'YYYY-MM-DD') "bookingDate"`,
        'fieldBooking.startTime "startTime"',
        'fieldBooking.endTime "endTime"',
        'fieldBooking.totalPrice "totalPrice"',
        'fieldBooking.originPrice "originPrice"',
        'fieldBooking.discountAmount "discountAmount"',
        'fieldBooking.status "fieldBookingStatus"',
        'user.email "userEmail"',
        'user.fullName "userName"',
        'refund.createdAt "createdAt"',
        'refund.updatedAt "updatedAt"',
        'sf.name "sportFieldName"',
        'sf.id "sportFieldId"',
        'br.name "branchName"',
        'br.id "branchId"',
      ]);
    if (status) {
      query = query.andWhere('refund.status = :status', { status });
    }
    if (bracnhId) {
      query = query.andWhere('br.id = :branchId', { branchId: bracnhId });
    }
    if (search) {
      query = query.andWhere(
        '(u.email ILIKE :search OR u.fullName ILIKE :search OR fb.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (staff.role !== STAFF_ROLE.ADMIN) {
      query = query.andWhere('br.id = :branchId', {
        branchId: staff.branchId.map(Number),
      });
    }
    const sortBy = sortKey ?? 'refund.createdAt';
    const [items, count] = await Promise.all([
      query
        .orderBy(sortBy, order as any)
        .take(limit)
        .skip(offset)
        .getRawMany(),
      query.getCount(),
    ]);
    //   .orderBy('refund.createdAt', 'DESC')
    return { items, count };
  }

  async findMyRefundAll(
    uid: string,
    limit: number,
    offset: number,
    status?: string,
    code?: string,
  ) {
    let query = this.refundRepo
      .createQueryBuilder('refund')
      .innerJoin('field_bookings', 'fb', 'fb.id = refund.fieldBookingId')
      .innerJoin('users', 'u', 'u.id = refund.userId')
      .innerJoin('sport_fields', 'sf', 'sf.id = fb.sportFieldId')
      .innerJoin('branches', 'br', 'br.id = sf.branchId')
      .where('u.uid = :uid', { uid })
      .select([
        'refund.id "id"',
        'refund.fieldBookingId "fieldBookingId"',
        'refund.userId "userId"',
        'refund.amount "amount"',
        'refund.reason "reason"',
        'refund.adminNote "adminNote"',
        'refund.status "status"',
        'fb.code "fieldBookingCode"',
        'fb.bookingDate "bookingDate"',
        'fb.startTime "startTime"',
        'fb.endTime "endTime"',
        'fb.totalPrice "totalPrice"',
        'u.email "userEmail"',
        'u.fullName "userName"',
        'refund.createdAt "createdAt"',
        'sf.name "sportFieldName"',
        'sf.id "sportFieldId"',
        'br.name "branchName"',
        'br.id "branchId"',
      ]);
    if (status) {
      query = query.andWhere('refund.status = :status', { status });
    }
    if (code) {
      query = query.andWhere('fb.code LIKE :code', {
        code: `%${code.toUpperCase()}%`,
      });
    }
    const [items, count] = await Promise.all([
      query
        .orderBy('refund.createdAt', 'DESC')
        .take(limit)
        .skip(offset)
        .getRawMany(),
      query.getCount(),
    ]);
    return { items, count };
  }

  async findOne(id: number): Promise<RefundsEntity | null> {
    return await this.refundRepo.findOne({
      where: { id },
      relations: ['fieldBooking'],
    });
  }

  async update(id: number, data: UpdateRefundDto): Promise<RefundsEntity> {
    //update also booking status
    await this.refundRepo.update(id, { ...data, updatedAt: new Date() });
    return this.findOne(id);
  }

  async processRefund(req: any, id: number, dto: ProcessRefundDto) {
    const staff = req.staff;
    const bookingData = await this.refundRepo
      .createQueryBuilder('rf')
      .innerJoin('field_bookings', 'fb', 'rf.field_booking_id = fb.id')
      .innerJoin('payments', 'p', 'p.field_booking_id = b.id')
      .innerJoin('users', 'u', 'fb.userId = u.id')
      .where('b.status = :status', {
        status: FieldBookingStatus.PAID,
      })
      .andWhere('rf.id = :id', { id })
      .andWhere('p.status = :status', {
        status: PaymentStatus.SUCCESS,
      })
      // approve and not process , or failed when process
      .andWhere('rf.status IN (:...acceptedStatatus)', {
        acceptedStatatus: [RefundStatus.APPROVED, RefundStatus.FAILED],
      })
      .select([
        'rf.id "refundId"',
        'fb.totalAmount "totalAmount"',
        'fb.code "bookingCode"',
        'p.transactionId "transactionId"',
        'u.email "userEmail"',
        'u.fullName "userName"',
      ])
      .getRawOne();

    if (!bookingData) {
      throw new BadRequestException('Dữ liệu yêu cầu hoàn tiền không hợp lệ');
    }

    if (dto.amount > bookingData.totalAmount) {
      throw new BadRequestException('Số tiền hoàn trả không hợp lệ');
    }

    // aprrove refund
    await this.refundRepo.update(id, {
      status: RefundStatus.APPROVED,
      adminNote: dto.adminNote,
      updatedAt: new Date(),
      updatedBy: staff.email,
    });

    const refundResponse = await this.paymentService.refund(
      bookingData.transactionId,
      dto.amount,
      `Refund for booking ${bookingData.bookingCode}`,
    );

    // failed
    if (!refundResponse || refundResponse.return_code == 2) {
      await this.refundRepo.update(id, {
        status: RefundStatus.FAILED,
        transactionId: refundResponse?.refund_id,
        failedReason: refundResponse?.return_message,
      });
      throw new BadRequestException(
        'Giao dịch hoàn tiền không thành công. Hãy thử lại sau.',
      );
    }
    if (refundResponse.return_code == 3) {
      await this.refundRepo.update(id, {
        status: RefundStatus.PROCESSING,
        transactionId: refundResponse?.refund_id,
      });
    }
    if (refundResponse.return_code == 1) {
      await this.refundRepo.update(id, {
        status: RefundStatus.COMPLETED,
        transactionId: refundResponse?.refund_id,
      });

      await this.mailService.sendRefundSuccessEmail(bookingData.userEmail, {
        bookingCode: bookingData.bookingCode,
        customerName: bookingData.userName,
        refundAmount: dto.amount,
        paymentMethod: 'ZaloPay',
      });
    }
  }

  async remove(id: number): Promise<void> {
    await this.refundRepo.delete(id);
  }

  async rejectRefund(req: any, id: number, dto: UpdateRefundDto) {
    const staff = req.staff;
    await this.refundRepo.update(id, {
      status: RefundStatus.REJECTED,
      adminNote: dto.adminNote,
      updatedAt: new Date(),
      updatedBy: staff.email,
    });
    return;
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
