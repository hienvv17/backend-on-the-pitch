import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ImportItemDto {
  @ApiProperty()
  @IsNumber()
  branchId: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  sportItemId: number;
}
