import { IsNotEmpty, Matches, IsString, IsEmail, IsOptional } from 'class-validator';
import { IsEndTimeAtLeastOneHourAfter } from '../../decorators/IsEndTimeAtLeastOneHourAfter.decorator.ts';
import { IsTimeString } from '../../decorators/IsTimeString.decorator';
import { IsValidDate } from '../../decorators/IsValidDate.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class GetBookedFieldDto {
    @ApiProperty()
    @IsValidDate({ message: 'bookingDate must be a valid date in YYYY-MM-DD format' })
    @IsNotEmpty()
    bookingDate: string; // e.g., "2025-04-13"

    @ApiProperty()
    @IsTimeString()
    @IsString()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty()
    @IsEndTimeAtLeastOneHourAfter('startTime')
    @IsTimeString()
    @IsString()
    @IsNotEmpty()
    endTime: string;
}
