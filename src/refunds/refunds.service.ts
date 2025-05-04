import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefundsEntity } from '../entities/refund.entity';
import { Repository } from 'typeorm';
import { CreateRefundDto } from './dto/create-refund-request.dto';
import {
  FieldBookingsEntity,
  FieldBookingStatus,
} from '../entities/field-bookings.entity';
import { UsersEntity } from '../entities/users.entity';
import { getCurrentTimeInUTC7 } from '../utils/helper/date-time.helper';
import constants from '../config/constants';
import { UpdateRefundDto } from './dto/update-refund-request.dto';
import moment from 'moment-timezone';

@Injectable()
export class RefundsService {
  constructor(
    @InjectRepository(RefundsEntity)
    private refundRepo: Repository<RefundsEntity>,
    @InjectRepository(FieldBookingsEntity)
    private fieldBookingRepo: Repository<FieldBookingsEntity>,
    @InjectRepository(UsersEntity)
    private usersRepo: Repository<UsersEntity>,
  ) {}

  async create(uid: string, dto: CreateRefundDto) {
    // Check if the field booking exists with PAID status
    console.log('dto', dto, uid);
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
    const currentDate = new Date(getCurrentTimeInUTC7());
    console.log(fieldBooking.bookingDate, fieldBooking.startTime);
    const base = moment.utc(fieldBooking.bookingDate).tz('Asia/Bangkok');
    // Combine the time
    const [hours, minutes] = fieldBooking.startTime.split(':').map(Number);
    const bookingDate = base
      .set({
        hour: hours,
        minute: minutes,
        second: 0,
        millisecond: 0,
      })
      .toDate();
    const timeDifference = bookingDate.getTime() - currentDate.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    console.log('hoursDifference', currentDate, bookingDate, hoursDifference);
    if (hoursDifference < minRefundTime) {
      throw new BadRequestException(
        `Bạn chỉ có thể yêu cầu hoàn tiền trễ nhất trước ${minRefundTime} giờ so với thời gian đã đặt.`,
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
      ...dto,
      userId: fieldBooking.userId,
      amount: fieldBooking.totalPrice,
    });
    return await this.refundRepo.save(refund);
  }

  async findAll(
    limit: number,
    offset: number,
    status?: string,
    bracnhId?: number,
  ) {
    let query = this.refundRepo
      .createQueryBuilder('refund')
      .innerJoin('field_bookings', 'fb', 'fb.id = refund.fieldBookingId')
      .innerJoin('users', 'u', 'u.id = refund.userId')
      .innerJoin('sport_fields', 'sf', 'sf.id = fb.sportFieldId')
      .innerJoin('branches', 'br', 'br.id = sf.branchId')
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
    if (bracnhId) {
      query = query.andWhere('br.id = :branchId', { branchId: bracnhId });
    }
    const [items, count] = await Promise.all([
      query
        .orderBy('refund.createdAt', 'DESC')
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
    await this.refundRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.refundRepo.delete(id);
  }
}
