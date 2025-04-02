import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldBookingEntity } from '../entities/field-booking.entity';
import { ResponseModule } from 'src/response/response.module';
import { FieldBookingController } from './field-booking.controller';
import { FieldBookingService } from './field-booking.service';
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
  controllers: [FieldBookingController],
  providers: [FieldBookingService],
  exports: [FieldBookingService],
})
export class FieldBookingModule {}
