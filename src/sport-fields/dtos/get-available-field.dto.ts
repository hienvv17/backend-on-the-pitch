import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class GetAvailableFieldDto {
  @IsNumber()
  @IsNotEmpty()
  sportCategoryId: number;

  @IsNumber()
  @IsNotEmpty()
  branchId: number;

  @Matches(/^\d{2}-\d{2}-\d{2}$/, {
    message: 'Date must be in format dd-mm-yy',
  })
  @IsString()
  @IsNotEmpty()
  date: string;

  @Matches(/^\d{2}:\d{2}$/, { message: 'Start time must be in format hh:mm' })
  @IsString()
  @IsOptional()
  startTime?: string;

  @Matches(/^\d{2}:\d{2}$/, { message: 'End time must be in format hh:mm' })
  @IsString()
  @IsOptional()
  endTime?: string;
}
