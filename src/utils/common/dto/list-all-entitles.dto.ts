import { IsString, IsIn, IsInt, IsPositive, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import constants from '../../../config/constants';
export type Order = 'ASC' | 'DESC';
export const order = ['ASC', 'DESC'];

export class ListAllEntities {
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  @IsInt()
  @IsOptional()
  limit?: number = constants.default.listItemLimit;

  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  @IsInt()
  @IsOptional()
  offset?: number = 0;

  @Transform(({ value }) => value.toUpperCase())
  @IsIn(order)
  @IsString()
  @IsOptional()
  order?: Order = 'ASC';

  @IsString()
  @IsOptional()
  search?: string;
}
