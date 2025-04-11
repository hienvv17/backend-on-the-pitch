import {
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';
import { STAFF_ROLE } from '../../entities/staff.entity';

export class UpdateStaffDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(STAFF_ROLE)
  @IsOptional()
  role?: STAFF_ROLE;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  branchIds?: string[];
}
