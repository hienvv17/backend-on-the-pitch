import { IsNotEmpty, Matches, IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { IsEndTimeAtLeastOneHourAfter } from '../../decorators/IsEndTimeAtLeastOneHourAfter.decorator.ts.js';
import { IsTimeString } from '../../decorators/IsTimeString.decorator.js';
import { IsValidDate } from '../../decorators/IsValidDate.decorator.js';
import { ApiProperty } from '@nestjs/swagger';
import { ListAllEntities } from '../../utils/common/dto/list-all-entitles.dto.js';

export class GetPersonalBookingHistoryDto extends ListAllEntities {

    @ApiProperty({ nullable: true })
    @IsValidDate({ message: 'bookingDate must be a valid date in YYYY-MM-DD format' })
    @IsOptional()
    bookingDate?: string; // e.g., "2025-04-13"

    @ApiProperty({ nullable: true })
    @IsNumber()
    @IsOptional()
    sportCategoryId?: number;

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
