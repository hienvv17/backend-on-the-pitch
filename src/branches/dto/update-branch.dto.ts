import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { IsEndTimeAtLeastOneHourAfter } from '../../decorators/IsEndTimeAtLeastOneHourAfter.decorator.ts';
import { IsTimeString } from '../../decorators/IsTimeString.decorator';

export class UpdateBranchDto {
  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  ward?: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ nullable: true })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiProperty({ nullable: true })
  @IsDateString()
  @IsOptional()
  activeDate?: string;

  @ApiProperty({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isHot?: boolean;

  @ApiProperty({ nullable: true })
  @IsTimeString()
  @IsString()
  @IsOptional()
  openTime?: string;

  @ApiProperty({ nullable: true })
  @IsEndTimeAtLeastOneHourAfter('openTime', {
    message: 'Close time must after openTime',
  })
  @IsTimeString()
  @IsString()
  @IsOptional()
  closeTime?: string;
}
