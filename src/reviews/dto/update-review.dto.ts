import {
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
