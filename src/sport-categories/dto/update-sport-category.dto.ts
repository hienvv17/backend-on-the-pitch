import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateSportCategoryDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
