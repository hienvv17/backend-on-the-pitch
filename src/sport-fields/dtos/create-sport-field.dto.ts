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
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsNumber()
  @IsNotEmpty()
  branchId: number;

  @IsNumber()
  @IsNotEmpty()
  sportCategoryId: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  images?: any;

  @IsArray()
  @IsNotEmpty()
  timeSlots: TimeSlotInput[];

  @IsOptional()
  @IsString()
  description?: string;
}
