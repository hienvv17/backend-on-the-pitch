import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldBookingsEntity } from '../entities/field-bookings.entity';
import { ResponseModule } from '../response/response.module';
import { FieldBookingsController } from './field-bookings.controller';
import { FieldBookingsService } from './field-bookings.service';
import { TimeSlotsEntity } from '../entities/time-slots.entity';
import { SportFieldsEntity } from '../entities/sport-fields.entity';
import { UsersEntity } from '../entities/users.entity';
import { UsersModule } from '../users/users.module';
import { BookingMailService } from '../mail/mail.service';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffsModule } from '../staffs/staffs.module';
import { RefundsEntity } from '../entities/refund.entity';
import { VouchersModule } from '../vouchers/vouchers.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FieldBookingsEntity,
      TimeSlotsEntity,
      SportFieldsEntity,
      UsersEntity,
      RefundsEntity,
    ]),
    ResponseModule,
    UsersModule,
    StaffsModule,
    VouchersModule,
    PaymentModule,
  ],
  controllers: [FieldBookingsController],
  providers: [FieldBookingsService, BookingMailService, FirebaseAdmin],
  exports: [FieldBookingsService],
})
export class FieldBookingsModule {}
