import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class CreateRefundDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  fieldBookingId: number;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  reason?: string;
}
