import {
  Body,
  Controller,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
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
import { GetPersonalBookingHistoryDto } from './dto/get-personal-booking-history.dto';
import { PayNowDto } from './dto/pay-now.dto';

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
    return this.responseService.successResponse({ bookingData });
  }

  @Post('pay-now')
  async payNow(@Body() dto: PayNowDto) {
    const bookingData = await this.fieldBookingsService.payNow(dto);
    return this.responseService.successResponse({ bookingData });
  }

  @UseGuards(StaffJwtGuard)
  @Post('manage/history')
  async getManageHistory(@Body() dto: GetBookingHistoryDto, @Request() req) {
    const { branchids, role } = req.staff;
    const { data, count } = await this.fieldBookingsService.getBookingHistory(
      dto,
      role,
      branchids,
    );
    return this.responseService.successResponse({ items: data, count: count });
  }

  @UseGuards(JwtGuard)
  @Post('history')
  async getPersonalHistory(
    @GetUser('uid') uid: string,
    @Body() dto: GetPersonalBookingHistoryDto,
  ) {
    const { items, count } =
      await this.fieldBookingsService.getPersonalBookingHistory(uid, dto);
    return this.responseService.successResponse({
      items,
      count,
    });
  }

  // for staff checkin for user
  @UseGuards(StaffJwtGuard)
  @Post('check-in')
  async checkBooking(@Request() req: any, @Body() body: { code: string }) {
    const booking = await this.fieldBookingsService.checkBookingCode(
      req,
      body.code,
    );
    return this.responseService.successResponse({ booking });
  }
}
