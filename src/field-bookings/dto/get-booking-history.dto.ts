import {
  IsNotEmpty,
  Matches,
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsIn,
} from 'class-validator';
import { IsEndTimeAtLeastOneHourAfter } from '../../decorators/IsEndTimeAtLeastOneHourAfter.decorator.ts.js';
import { IsTimeString } from '../../decorators/IsTimeString.decorator.js';
import { IsValidDate } from '../../decorators/IsValidDate.decorator.js';
import { ApiProperty } from '@nestjs/swagger';
import { FieldBookingStatus } from '../../entities/field-bookings.entity.js';
import { ListAllEntities } from '../../utils/common/dto/list-all-entitles.dto.js';

export class GetBookingHistoryDto extends ListAllEntities {
  @ApiProperty()
  @IsValidDate({
    message: 'fromDate must be a valid date in YYYY-MM-DD format',
  })
  @IsOptional()
  fromDate?: string; // e.g., "2025-04-13"

  @ApiProperty()
  @IsValidDate({ message: 'toDate must be a valid date in YYYY-MM-DD format' })
  @IsOptional()
  toDate?: string; // e.g., "2025-04-13"

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

  @ApiProperty({ nullable: true })
  @IsNumber()
  @IsOptional()
  sportCategoryId?: number;

  @ApiProperty({ nullable: true })
  @IsNumber()
  @IsOptional()
  userId?: number;

  @ApiProperty({ nullable: true })
  @IsIn(Object.values(FieldBookingStatus))
  @IsString()
  @IsOptional()
  status?: string = FieldBookingStatus.PAID;
}
