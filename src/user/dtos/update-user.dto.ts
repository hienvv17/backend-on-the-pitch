import { IsOptional, IsString } from 'class-validator';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
