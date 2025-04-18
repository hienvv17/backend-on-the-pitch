import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateSportCategoryDto {
  @ApiProperty({ nullable: true })
  @Length(1, 100)
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
