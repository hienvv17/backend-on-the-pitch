import { Controller } from '@nestjs/common';
import { ResponseService } from '../response/response.service';
import { FieldBookingsService } from './field-bookings.service';

@Controller('field-bookings')
export class FieldBookingsController {
  constructor(
    private fieldBookingsService: FieldBookingsService,
    private responseService: ResponseService,
  ) {}
}
