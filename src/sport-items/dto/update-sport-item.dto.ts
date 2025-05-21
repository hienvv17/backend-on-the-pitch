import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class UpdateSportItemDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty()
  @IsPositive()
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ nullable: true })
  @IsArray()
  @IsOptional()
  images?: string[];
}
