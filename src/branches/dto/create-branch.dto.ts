import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { IsEndTimeAtLeastOneHourAfter } from 'src/decorators/IsEndTimeAtLeastOneHourAfter.decorator.ts';
import { IsTimeString } from 'src/decorators/IsTimeString.decorator';

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

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  longtitude?: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  latitude?: string;

  @ApiProperty({ nullable: true })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiProperty({ nullable: true })
  @IsDateString()
  @IsOptional()
  activeDate?: string;

  @ApiProperty()
  @IsTimeString()
  @IsString()
  @IsNotEmpty()
  openTime: string;

  @ApiProperty()
  @IsEndTimeAtLeastOneHourAfter('openTime', {
    message: 'Close time must after openTime',
  })
  @IsTimeString()
  @IsString()
  @IsNotEmpty()
  closeTime: string;
}
