import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateSportCategoryDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
