import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { FixedBookingRequestService } from './fixed-booking-request.service';
import { FixedBookingRequestEntity } from '../entities/fixing-booking-request.entity';
import { CreateFixedBookingDto } from './dto/create-fix-booking.dto';
import { ResponseService } from '../response/response.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Fixed Booking Request')
@Controller('fixed-booking-requests')
export class FixedBookingRequestController {
  constructor(
    private readonly fixedBookingService: FixedBookingRequestService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  findAll(): Promise<FixedBookingRequestEntity[]> {
    return this.fixedBookingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<FixedBookingRequestEntity> {
    return this.fixedBookingService.findOne(Number(id));
  }

  @Post()
  async create(@Body() body: CreateFixedBookingDto) {
    await this.fixedBookingService.create(body);
    return this.responseService.successResponse({});
  }
  s;

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<FixedBookingRequestEntity>,
  ) {
    return this.fixedBookingService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fixedBookingService.delete(Number(id));
  }
}
