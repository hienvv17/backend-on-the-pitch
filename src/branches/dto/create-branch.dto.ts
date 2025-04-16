import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CreateBranchDto {
   @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ward: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  longtitude?: string;


  @IsString()
  @IsOptional()
  latitude?: string;
  
  @ApiProperty()
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  activeDate?: string;
}
