import { Body, Controller, Post } from '@nestjs/common';
import { ResponseService } from '../response/response.service';
import { FieldBookingsService } from './field-bookings.service';
import { CreateBookingDto } from './dto/create-booking-field.dto';
import { BookingMailService } from '../mail/mail.service';

@Controller('field-bookings')
export class FieldBookingsController {
  constructor(
    private fieldBookingsService: FieldBookingsService,
    private responseService: ResponseService,
    private bookingMailService: BookingMailService
  ) { }

  @Post('new')
  async create(@Body() dto: CreateBookingDto) {
    const bookingData = await this.fieldBookingsService.createFieldBooking(dto)
    await this.bookingMailService.sendBookingSuccessEmail(
      dto.email,
      {
        code: bookingData.code,
        customerName: dto.email,
        fieldName: bookingData.fieldName,
        bookingDate: bookingData.bookingDate,
        branchName: bookingData.branchName,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime
      }
    );
    return this.responseService.successResponse({bookingData});
  }
  //to do
  /**
   * creat review endpoint
   * get personal booking
   * manage booking for admin
   * get schedule booking for all staff - have searching by \
   * update booking have code - generate OTP-nine-number
   */
}
