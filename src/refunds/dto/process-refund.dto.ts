import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { RefundStatus } from '../../entities/refund.entity';

export class ProcessRefundDto {
  @IsOptional()
  @IsEnum(RefundStatus)
  status?: RefundStatus;

  @IsOptional()
  @IsString()
  adminNote?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;
}
