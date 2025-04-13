import { BadRequestException, Injectable } from '@nestjs/common';
import {
  FieldBookingsEntity,
  FieldBookingStatus,
} from '../entities/field-bookings.entity';
import { SportFieldsEntity } from '../entities/sport-fields.entity';
import { TimeSlotsEntity } from '../entities/time-slots.entity';
import { UsersEntity } from '../entities/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

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
  ) {}

  async getAllFieldBooking() {
    return this.fieldBookingRepo.find();
  }

  async getPersonalBooking() {
    return this.fieldBookingRepo.find();
  }

  async createFieldBooking(dto: {
    fieldId: number;
    userId: number | null;
    email: string;
    date: string;
    startTime: string;
    endTime: string;
  }) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      return ''; // find in firebase => create user  }   // same with staff here
    }
    // can not booking date in history
    const selectedDate = new Date(dto.date + ' ' + dto.startTime);
    if (selectedDate > new Date()) {
      throw new BadRequestException('Invalid booking time');
    }
    //Can not booking if time_slot has been select
    const field = await this.sportFieldRepo.findOne({
      where: { id: dto.fieldId },
    });
    if (!field) {
      throw new BadRequestException('Sport field is not exist');
    }

    const bookedField = await this.fieldBookingRepo
      .createQueryBuilder('booking')
      .where('booking.sportFieldId = :fieldId', { fieldId: dto.fieldId })
      .andWhere('booking.bookingDate = :date', { date: dto.date })
      .andWhere('booking.beginTime > :startTime', { startTime: dto.startTime })
      .andWhere('booking.beginTime < :endTime', { endTime: dto.endTime })
      .andWhere('booking.endTime > :startTime', { startTime: dto.startTime })
      .andWhere('booking.endTime < :endTime', { endTime: dto.endTime })
      .andWhere('booking.status != :status', {
        status: FieldBookingStatus.CANCELLED,
      })
      .getOne();

    if (bookedField) {
      throw new BadRequestException('Field is unavailable to booking!');
    }
    // create fieldBooking
    const newBooking = this.fieldBookingRepo.create({
      ...dto,
      status: FieldBookingStatus.PAID,
    });
    return this.fieldBookingRepo.save(newBooking);
  }
}
