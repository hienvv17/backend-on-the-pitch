import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  uid: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  picture?: string;
}
