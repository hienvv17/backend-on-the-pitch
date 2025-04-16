import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateSportCategoryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
