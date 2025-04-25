import { IsEnum, IsDateString, IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VoucherStatus, VoucherType } from 'src/entities/vouchers.entity';

export class CreateVoucherDto {
    @ApiProperty()
    @IsString()
    code: string;

    @ApiProperty({ enum: VoucherType })
    @IsEnum(VoucherType)
    type: VoucherType;

    @ApiProperty()
    @IsNumber()
    discountAmount: number;

    @ApiProperty()
    @IsDateString()
    expireDate: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    userId?: number;

    @ApiProperty({ enum: VoucherStatus, required: false })
    @IsOptional()
    @IsEnum(VoucherStatus)
    status?: VoucherStatus;
}
