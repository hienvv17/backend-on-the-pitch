import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateSportItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  images?: any;
}
