import {
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';
import { STAFF_ROLE } from '../../entities/staffs.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStaffDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty()
  @IsEnum(STAFF_ROLE)
  @IsOptional()
  role?: STAFF_ROLE;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  branchIds?: string[];
}
