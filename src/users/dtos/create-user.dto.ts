import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  uid?: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  picture?: string;
}
