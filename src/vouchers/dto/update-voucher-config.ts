import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class UpdateVoucherConfigDto {

  @ApiProperty()
  @Length(1, 10)
  @IsString()
  @IsOptional()
  voucherCode?: string;

  @ApiProperty({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty()
  @Min(1)
  @IsInt()
  @IsOptional()
  percentDiscount?: number;

  @ApiProperty()
  @Min(1)
  @IsInt()
  @IsOptional()
  maxDiscountAmount?: number; 

  @ApiProperty()
  @Min(1)
  @IsPositive()
  @IsInt()
  @IsOptional()
  validDays?: number;

  @ApiProperty()
  @Min(1)
  @IsPositive()
  @IsInt()
  @IsOptional()
  amountToTrigger?: number;
}
