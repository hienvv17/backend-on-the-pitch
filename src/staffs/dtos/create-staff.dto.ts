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
  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ nullable: true })
  @IsEnum(STAFF_ROLE)
  @IsOptional()
  role?: STAFF_ROLE = STAFF_ROLE.STAFF;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ nullable: true })
  @IsOptional()
  activeDate?: Date;

  @ApiProperty({ nullable: true })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  branchIds?: string[];
}
