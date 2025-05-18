import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { RefundStatus } from '../../entities/refund.entity';

export class ProcessRefundDto {
  @IsOptional()
  @IsString()
  adminNote?: string;

  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  amount: number; // null will full amount
}
