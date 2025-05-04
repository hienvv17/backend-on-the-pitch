import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
export class CreateRefundDto {
  @IsNotEmpty()
  @IsNumber()
  fieldBookingId: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
