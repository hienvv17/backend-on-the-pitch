import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { IsEndTimeAtLeastOneHourAfter } from '../../decorators/IsEndTimeAtLeastOneHourAfter.decorator.ts';
import { IsTimeString } from '../../decorators/IsTimeString.decorator';
import { IsValidDate } from '../../decorators/IsValidDate.decorator';

export class GetAvailableFieldDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  sportCategoryId?: number;

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
