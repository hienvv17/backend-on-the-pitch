import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldBookingsEntity } from '../entities/field-bookings.entity';
import { ResponseModule } from 'src/response/response.module';
import { FieldBookingsController } from './field-bookings.controller';
import { FieldBookingsService } from './field-bookings.service';
import { TimeSlotsEntity } from 'src/entities/time-slots.entity';
import { SportFieldsEntity } from 'src/entities/sport-fields.entity';
import { UsersEntity } from 'src/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FieldBookingsEntity,
      TimeSlotsEntity,
      SportFieldsEntity,
      UsersEntity,
    ]),
    ResponseModule,
  ],
  controllers: [FieldBookingsController],
  providers: [FieldBookingsService],
  exports: [FieldBookingsService],
})
export class FieldBookingsModule {}
