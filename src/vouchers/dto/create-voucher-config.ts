import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { VoucherType } from '../../entities/vouchers.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVoucherConfigDto {
  @ApiProperty()
  @IsString()
  @IsEnum(VoucherType)
  @IsNotEmpty()
  type: VoucherType;

  @ApiProperty()
  @Length(1, 10)
  @IsString()
  @IsNotEmpty()
  voucherCode: string;

  @ApiProperty({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty()
  @Min(1)
  @IsInt()
  @IsNotEmpty()
  percentDiscount: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  maxDiscountAmount: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  validDays: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  amountToTrigger?: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  minBookingAmount?: number;
}
