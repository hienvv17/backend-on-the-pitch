import {
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { STAFF_ROLE } from '../../entities/staffs.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStaffDto {
  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ nullable: true })
  @IsEnum(STAFF_ROLE)
  @IsOptional()
  role?: STAFF_ROLE;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ nullable: true })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  branchIds?: string[];

  @ApiProperty({ nullable: true })
  @IsDateString()
  @IsNotEmpty()
  activeDate: string;
}
