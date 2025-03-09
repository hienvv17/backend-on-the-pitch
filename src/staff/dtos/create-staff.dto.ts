import { STAFF_ROLE } from '@src/entities/staff.entity';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateStaffDto {
  @IsString()
  uid: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsEmail()
  email: string;

  @IsString()
  phoneNumber: string;

  @IsEnum(STAFF_ROLE)
  role?: STAFF_ROLE;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  activeDate?: Date;
}
