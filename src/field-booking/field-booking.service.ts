import { Injectable } from '@nestjs/common';
import { FieldBookingEntity } from '../entities/field-booking.entity';
import { SportFieldEntity } from '../entities/sport-field.entity';
import { TimeSlotEntity } from '../entities/time-slot.entity';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FieldBookingService {
  constructor(
    private fieldBookingRepo: Repository<FieldBookingEntity>,
    private sportFieldRepo: Repository<SportFieldEntity>,
    private timeSlotRepo: Repository<TimeSlotEntity>,
    private userRepo: Repository<UserEntity>,
  ) {}

  async getAllFieldBooking() {
    return this.fieldBookingRepo.find();
  }
  /**
   * to do
   * get all field booking by user id
   * get all field booking by sport field id
   * get all field booking by day
   */
}
