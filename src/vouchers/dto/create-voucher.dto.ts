import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsDate,
  Min,
  MaxLength,
  Max,
  IsNotEmpty,
  IsDateString,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  VoucherStatus,
  VoucherStatusType,
  VoucherType,
} from '../../entities/vouchers.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVoucherDto {
  @ApiProperty()
  @IsEnum(VoucherType)
  type: VoucherType;

  @ApiProperty()
  @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @Min(1)
  @IsInt()
  @IsNotEmpty()
  maxDiscountAmount: number;

  @ApiProperty()
  @Max(100)
  @Min(1)
  @IsInt()
  percentDiscount: number;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validFrom?: Date;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  validTo?: Date;

  @ApiProperty()
  @IsEnum(VoucherStatus)
  @IsOptional()
  status?: VoucherStatusType;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  minBookingAmount: number;
}
