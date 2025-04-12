import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldBookingEntity } from '../entities/field-booking.entity';
import { ResponseModule } from 'src/response/response.module';
import { FieldBookingsController } from './field-bookings.controller';
import { FieldBookingsService } from './field-bookings.service';
import { TimeSlotEntity } from 'src/entities/time-slot.entity';
import { SportFieldEntity } from 'src/entities/sport-field.entity';
import { UserEntity } from 'src/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FieldBookingEntity,
      TimeSlotEntity,
      SportFieldEntity,
      UserEntity,
    ]),
    ResponseModule,
  ],
  controllers: [FieldBookingsController],
  providers: [FieldBookingsService],
  exports: [FieldBookingsService],
})
export class FieldBookingsModule {}
