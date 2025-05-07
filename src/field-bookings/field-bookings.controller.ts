import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ResponseService } from '../response/response.service';
import { FieldBookingsService } from './field-bookings.service';
import { CreateBookingDto } from './dto/create-booking-field.dto';
import { BookingMailService } from '../mail/mail.service';
import { GetBookingHistoryDto } from './dto/get-booking-history.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { StaffJwtGuard } from '../auth/guard/staff-jwt.guard';
import { CheckBookingDto } from './dto/check-booking.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Field Booking')
@Controller('field-bookings')
export class FieldBookingsController {
  constructor(
    private fieldBookingsService: FieldBookingsService,
    private responseService: ResponseService,
    private bookingMailService: BookingMailService,
  ) {}

  @Post('new')
  async create(@Body() dto: CreateBookingDto) {
    const bookingData = await this.fieldBookingsService.createFieldBooking(dto);
    // await this.bookingMailService.sendBookingSuccessEmail(dto.email, {
    //   code: bookingData.code,
    //   customerName: dto.email,
    //   fieldName: bookingData.fieldName,
    //   bookingDate: bookingData.bookingDate,
    //   branchName: bookingData.branchName,
    //   startTime: bookingData.startTime,
    //   endTime: bookingData.endTime,
    // });
    return this.responseService.successResponse({ bookingData });
  }

  @UseGuards(StaffJwtGuard)
  @Post('manage/history')
  async getManageHistory(@Body() dto: GetBookingHistoryDto, @Req() req) {
    const { branchids, role } = req.staff;
    const { data, count, limit, offset } =
      await this.fieldBookingsService.getBookingHistory(dto, role, branchids);
    return this.responseService.successResponse({ items: data, count: count });
  }

  @UseGuards(JwtGuard)
  @Post('history')
  async getPersonalHistory(
    @GetUser('uid') uid: string,
    @Body() dto: GetBookingHistoryDto,
  ) {
    const bookingHistories =
      await this.fieldBookingsService.getPersonalBookingHistory(uid, dto);
    return this.responseService.successResponse({
      items: bookingHistories[0],
      count: bookingHistories[1],
    });
  }

  // @UseGuards(StaffJwtGuard)
  @Post('check-booking')
  async checkBooking(@Body() dto: CheckBookingDto) {
    const bookingHistories = await this.fieldBookingsService.checkBooking(dto);
    return this.responseService.successResponse({ bookingHistories });
  }

  //to do
  /**
   * creat review endpoint
   * think again that staff can see all booking history - or showing only today
   */
}
