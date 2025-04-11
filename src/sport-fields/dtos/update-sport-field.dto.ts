import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TimeSlotInput } from './create-sport-field.dto';
export class UpdateSportFieldDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsNumber()
  branchId?: number;

  @IsOptional()
  @IsNumber()
  sportCategoryId?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  images?: any;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsOptional()
  timeSlots?: TimeSlotInput[];
}
