import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class GetAvailableFieldDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sportCategoryId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  branchId: number;

  @ApiProperty()
  @Matches(/^\d{2}-\d{2}-\d{2}$/, {
    message: 'Date must be in format dd-mm-yy',
  })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Start time must be in format hh:mm' })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiProperty()
  @Matches(/^\d{2}:\d{2}$/, { message: 'End time must be in format hh:mm' })
  @IsString()
  @IsOptional()
  endTime?: string;
}
