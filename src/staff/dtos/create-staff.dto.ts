import {
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { STAFF_ROLE } from '../../entities/staff.entity';

export class CreateStaffDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(STAFF_ROLE)
  @IsOptional()
  role?: STAFF_ROLE = STAFF_ROLE.STAFF;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  activeDate?: Date;
}
