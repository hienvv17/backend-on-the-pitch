import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  result?: any;
}
