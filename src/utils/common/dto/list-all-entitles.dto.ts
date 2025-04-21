import { IsString, IsIn, IsInt, IsPositive, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import constants from '../../../config/constants';
import { ApiProperty } from '@nestjs/swagger';
export type Order = 'ASC' | 'DESC';
export const order = ['ASC', 'DESC'];

export class ListAllEntities {
  @ApiProperty({ nullable: true })
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  @IsInt()
  @IsOptional()
  limit?: number = constants.default.listItemLimit;

  @ApiProperty({ nullable: true })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsOptional()
  offset?: number = 0;

  @ApiProperty({ nullable: true })
  @Transform(({ value }) => value.toUpperCase())
  @IsIn(order)
  @IsString()
  @IsOptional()
  order?: Order = 'ASC';

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;
}
