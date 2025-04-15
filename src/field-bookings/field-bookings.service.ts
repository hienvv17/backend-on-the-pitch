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
import { GetBookedFieldDto } from './dto/get-booked-field.dto';
import { getCurrentTimeInUTC7 } from '../utils/helper/date-time.helper';

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

  async getAllFieldBooking() {
    return this.fieldBookingRepo.find();
  }

  async getPersonalBooking() {
    return this.fieldBookingRepo.find();
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
    //Can not booking if time_slot has been select
    const field = await this.sportFieldRepo.findOne({
      where: { id: dto.sportFieldId, isActive: true },
    });
    if (!field) {
      throw new BadRequestException('Sport field is not exist');
    }

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
      userId: user.id,
      code: this.generateBookingCode(),
      status: FieldBookingStatus.PAID
    }
  }

  async checkBookedField(dto: GetBookedFieldDto) {
    //to do: get all booking in this day
  }

  async createMultiBookingField(dto: GetBookedFieldDto) {
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

  //to do:change sportField for existing booking because problem with sportField
  // refund to customer if can change
}
