import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { TimeSlotInput } from './create-sport-field.dto';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateSportFieldDto {
  @ApiProperty({ nullable: true })
  @IsOptional()
  @MaxLength(100)
  @IsString()
  name?: string;

  @ApiProperty({ nullable: true })
  @IsNumber()
  @IsOptional()
  branchId?: number;

  @ApiProperty({ nullable: true })
  @IsNumber()
  @IsOptional()
  sportCategoryId?: number;

  @ApiProperty({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ nullable: true })
  @IsOptional()
  images?: any;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ nullable: true })
  @IsArray()
  @IsOptional()
  timeSlots?: TimeSlotInput[];

  @ApiProperty({ nullable: true })
  @IsPositive()
  @IsNumber()
  @IsOptional()
  defaultPrice?: number;
}
