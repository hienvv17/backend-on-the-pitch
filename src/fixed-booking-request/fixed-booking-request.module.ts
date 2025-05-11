import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixedBookingRequestEntity } from '../entities/fixing-booking-request.entity';
import { FixedBookingRequestController } from './fixed-booking-request.controller';
import { FixedBookingRequestService } from './fixed-booking-request.service';
import { ResponseModule } from '../response/response.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FixedBookingRequestEntity]),
    ResponseModule,
  ],
  controllers: [FixedBookingRequestController],
  providers: [FixedBookingRequestService],
  exports: [FixedBookingRequestService],
})
export class FixedBookingRequestModule {}
