import { Controller } from '@nestjs/common';
import { ResponseService } from '../response/response.service';
import { FieldBookingService } from './field-booking.service';

@Controller('field-booking')
export class FieldBookingController {
  constructor(
    private fieldBookingService: FieldBookingService,
    private responseService: ResponseService,
  ) {}
}
