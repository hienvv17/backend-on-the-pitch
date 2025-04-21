import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateSportCategoryDto {
  @ApiProperty()
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
