import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  IsPositive,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  fieldBookingId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ default: 5 })
  @Max(5)
  @Min(1)
  @IsPositive()
  @IsInt()
  rating: number;

  @ApiProperty({ nullable: true })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];
}
