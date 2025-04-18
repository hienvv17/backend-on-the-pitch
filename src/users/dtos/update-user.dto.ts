import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
