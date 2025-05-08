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

  @ApiProperty({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ nullable: true })
  @IsOptional()
  images?: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  timeSlots?: TimeSlotInput[];

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({})
  @IsNumber()
  @IsNotEmpty()
  defaultPrice: number;

  @ApiProperty({ nullable: true })
  @IsBoolean()
  @IsOptional()
  hasCanopy?: boolean;
}
