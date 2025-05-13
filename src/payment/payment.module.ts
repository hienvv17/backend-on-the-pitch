import { forwardRef, Module, Res } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ResponseModule } from '../response/response.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsEntity } from '../entities/payment.entity';
import { FieldBookingsEntity } from '../entities/field-bookings.entity';
import { BookingMailService } from '../mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentsEntity, FieldBookingsEntity]),
    ResponseModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, BookingMailService],
  exports: [PaymentService],
})
export class PaymentModule {}
