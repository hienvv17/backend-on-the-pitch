import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @IsString()
  @IsOptional()
  result?: any;
}
