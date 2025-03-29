import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  ward: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  longtitude?: string;

  @IsString()
  @IsOptional()
  latitude?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsDateString()
  @IsOptional()
  activeDate?: string;
}
