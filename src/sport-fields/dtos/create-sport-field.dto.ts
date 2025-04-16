import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  IsNotEmpty,
  IsArray,
} from 'class-validator';

export type TimeSlotInput = {
  startTime: string;
  endTime: string;
  pricePerHour: number;
};

export class CreateSportFieldDto {
  
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  branchId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sportCategoryId: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty()
  @IsOptional()
  images?: any;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  timeSlots: TimeSlotInput[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;
}
