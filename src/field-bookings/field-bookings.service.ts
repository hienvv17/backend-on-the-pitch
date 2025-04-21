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
import { getCurrentTimeInUTC7, isInServiceTime } from '../utils/helper/date-time.helper';
import { GetPersonalBookingHistoryDto } from './dto/get-personal-booking-history.dto';
import { CheckBookingDto } from './dto/check-booking.dto';

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
  ) { }

  async getBookingHistory(dto: GetBookingHistoryDto) {
    const {
      fromDate,
      toDate,
      startTime,
      endTime,
      sportCategoryId,
      userId,
      status,
      limit,
      offset
    } = dto;

    const query = this.getBookingQuery()
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
    if (status) {
      query.andWhere('fb.status = :status', { status });
    }
    query
      .orderBy('fb.booking_date', 'DESC')
      .addOrderBy('fb.start_time', 'DESC');

    const total = await query.getCount();
    const data = await query.select([
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
      'sc.name "sportCategoryName"'
    ])
      .limit(limit)
      .offset(offset)
      .getRawMany()

    return { data: data, count: total, limit: limit, offset }
  }


  async getPersonalBookingHistory(uid: string, dto: GetPersonalBookingHistoryDto) {
    const query = this.getBookingQuery()
    query.where('u.uid = :uid', { uid })
      .andWhere('fb.status NOT IN (:...status)', { status: [FieldBookingStatus.CANCELLED] })

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
        'sc.name "sportCategoryName"'
      ])
      .orderBy('fb.booking_date', 'DESC')
      .addOrderBy('fb.start_time', 'DESC')
      .limit(dto.limit)
      .offset(dto.offset)

    return await query.getManyAndCount();
  }


  async createFieldBooking(dto: CreateBookingDto) {
    let user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      user = await this.userService.create({ email: dto.email })
    }
    const selectedDate = new Date(dto.bookingDate + ' ' + dto.startTime);
    const currentTime = getCurrentTimeInUTC7()
    if (selectedDate < new Date(currentTime)) {
      throw new BadRequestException('Invalid booking time');
    }

    const field = await this.sportFieldRepo.findOne({
      where: { id: dto.sportFieldId, isActive: true },
      relations: {
        branch: true,
      }
    });
    console.log(field, 'field data')
    if (!field) {
      throw new BadRequestException('Sport field is not exist');
    }

    if (!isInServiceTime(field.branch.openTime, field.branch.closeTime, dto.startTime, dto.endTime)) { throw new BadRequestException('Time booking is out of service time') }
    const bookedField = await this.fieldBookingRepo
      .createQueryBuilder('booking')
      .where('booking.bookingDate = :bookingDate', { bookingDate: dto.bookingDate })
      .andWhere('booking.status NOT IN (:...status)', {
        status: [FieldBookingStatus.CANCELLED, FieldBookingStatus.REFUND],
      })
      .andWhere('booking.sportFieldId = :sportFieldId', { sportFieldId: dto.sportFieldId })
      .andWhere(
        new Brackets(qb => {
          qb.where(
            new Brackets(ib => {
              ib.where('booking.startTime < :startTime', { startTime: dto.startTime })
                .andWhere('booking.endTime > :startTime', { startTime: dto.startTime })
            })
          )
            .orWhere(new Brackets(ib => {
              ib.where('booking.startTime < :endTime', { endTime: dto.endTime })
                .andWhere('booking.endTime > :endTime', { endTime: dto.endTime })
            }))
            .orWhere(new Brackets(ib => {
              ib.where('booking.startTime <= :startTime', { startTime: dto.startTime })
                .andWhere('booking.endTime >= :endTime', { endTime: dto.endTime })
            }))
            .orWhere(new Brackets(ib => {
              ib.where('booking.startTime >= :startTime', { startTime: dto.startTime })
                .andWhere('booking.endTime <= :endTime', { endTime: dto.endTime })
            }))
        })
      )
      .getOne();

    if (bookedField) {
      throw new BadRequestException('Field is unavailable to booking!');
    }
    // create fieldBooking
    // const newBooking = this.fieldBookingRepo.create({
    //   ...dto,
    //   userId: user.id,
    //   code: this.generateBookingCode(),
    //   status: FieldBookingStatus.PAID,
    // });
    // return this.fieldBookingRepo.save(newBooking);
    return {
      ...dto,
      fieldName: field.name,
      branchName: field.branch.name,
      userId: user.id,
      code: this.generateBookingCode(),
      status: FieldBookingStatus.PAID
    }
  }

  async checkBooking(dto: CheckBookingDto) {
    const {
      email,
      bookingDate,
      startTime,
      endTime,
      sportCategoryId,
      limit
    } = dto;

    const query = this.getBookingQuery()
    query
      .where('u.email LIKE :email', { email: `%${email}%` })
      .andWhere('fb.status = :status', { status: FieldBookingStatus.PAID })

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

    query.select([
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
      'sc.name "sportCategoryName"'
    ])
      .limit(limit)
      .orderBy('fb.booking_date', 'DESC')
      .addOrderBy('fb.start_time', 'DESC');

    return await query.getRawMany();
  }

  async extendTimeBooking(dto: GetBookingHistoryDto) {
    //to do: accept booking 30 more => searh availble time with gap 30 accepted
  }

  async createMultiBookingField(dto: GetBookingHistoryDto) {
    //to do: create for one month - or 3 week with same time
    /**
     * separate booking : can refund request if need
     *  -- pay in current week
     *  -- schedule payment before 4 day this timeSlot
     */
  }


  generateBookingCode(): string {
    return 'OTP-' + uuidv4().split('-')[0].toUpperCase();
  }

  getBookingQuery() {
    return this.fieldBookingRepo.createQueryBuilder('fb')
      .innerJoin('users', 'u', 'u.id = fb.user_id')
      .innerJoin('sport_fields', 'sf', 'sf.id = fb.sport_field_id')
      .innerJoin('branches', 'br', 'br.id = sf.branch_id')
      .innerJoin('sport_categories', 'sc', 'sc.id = sf.sport_category_id')
  }

}
