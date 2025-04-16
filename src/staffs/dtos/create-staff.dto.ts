import {
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
import { STAFF_ROLE } from '../../entities/staffs.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty()
  @IsEnum(STAFF_ROLE)
  @IsOptional()
  role?: STAFF_ROLE = STAFF_ROLE.STAFF;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty()
  @IsOptional()
  activeDate?: Date;

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  branchIds?: string[];
}
