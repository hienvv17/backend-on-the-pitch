import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { IsEndTimeAtLeastOneHourAfter } from 'src/decorators/IsEndTimeAtLeastOneHourAfter.decorator.ts';
import { IsTimeString } from 'src/decorators/IsTimeString.decorator';
import { IsValidDate } from 'src/decorators/IsValidDate.decorator';

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
  @IsValidDate()
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ nullable: true })
  @IsTimeString()
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiProperty({ nullable: true })
  @IsEndTimeAtLeastOneHourAfter('startTime')
  @IsTimeString()
  @IsString()
  @IsOptional()
  endTime?: string;
}
