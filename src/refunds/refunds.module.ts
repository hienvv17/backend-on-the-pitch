import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { RefundsEntity } from '../entities/refund.entity';
import { FieldBookingsEntity } from '../entities/field-bookings.entity';
import { ResponseModule } from '../response/response.module';
import { StaffsModule } from '../staffs/staffs.module';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { UsersEntity } from '../entities/users.entity';
import { BookingMailService } from '../mail/mail.service';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefundsEntity, FieldBookingsEntity, UsersEntity]),
    ResponseModule,
    StaffsModule,
    PaymentModule,
  ],
  controllers: [RefundsController],
  providers: [RefundsService, FirebaseAdmin, BookingMailService],
  exports: [RefundsService],
})
export class RefundsModule {}
