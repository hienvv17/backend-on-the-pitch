import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { IsEndTimeAtLeastOneHourAfter } from '../../decorators/IsEndTimeAtLeastOneHourAfter.decorator.ts.js';
import { IsTimeString } from '../../decorators/IsTimeString.decorator.js';
import { IsValidDate } from '../../decorators/IsValidDate.decorator.js';
import { ApiProperty } from '@nestjs/swagger';

export class PayNowDto {
  @ApiProperty({ description: 'Mã đặt sân đã có sẵn' })
  @IsString()
  @IsNotEmpty()
  bookingCode: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sportFieldId: number;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsValidDate({
    message: 'bookingDate must be a valid date in YYYY-MM-DD format',
  })
  @IsNotEmpty()
  bookingDate: string; // e.g., "2025-04-13"

  @ApiProperty()
  @IsTimeString()
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty()
  @IsEndTimeAtLeastOneHourAfter('startTime')
  @IsTimeString()
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ description: 'Số tiền thanh toán' })
  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;

  @ApiProperty({ description: 'Giá gốc' })
  @IsNotEmpty()
  originPrice: number;

  @ApiProperty({ description: 'Số tiền giảm giá' })
  @IsNumber()
  @IsNotEmpty()
  discountAmount: number = 0; // Discount amount

  @ApiProperty({ nullable: true, description: 'Mã giảm giá' })
  @IsString()
  @IsOptional()
  voucherCode?: string; // Optional field for voucher code
}
