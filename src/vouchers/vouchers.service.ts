import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateVoucherDto } from './dto/create-voucher.dto';
import { VouchersEntity } from 'src/entities/vouchers.entity';
import { VoucherConfig } from 'src/entities/voucher-config.entity';
import { CreateVoucherConfigDto } from './dto/create-voucher-config';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(VouchersEntity)
    private readonly voucherRepo: Repository<VouchersEntity>,
    private readonly voucherConfigRepo: Repository<VoucherConfig>,
  ) {}

  async create(dto: CreateVoucherDto) {
    const voucher = this.voucherRepo.create(dto);
    return this.voucherRepo.save(voucher);
  }

  async createConfig(dto: CreateVoucherConfigDto) {
    const voucher = this.voucherConfigRepo.create(dto);
    return this.voucherConfigRepo.save(voucher);
  }

  async findManageAll() {
    return this.voucherRepo.find();
  }

  async findMyVoucherAll(uid: string, limit: number = 20, offset: number = 0) {
    return this.voucherRepo
      .createQueryBuilder('voucher')
      .leftJoin('voucher.user', 'user')
      .where('user.uid = :uid', { uid })
      .andWhere('voucher.validTo > NOW()')
      .orderBy('voucher.createdAt', 'DESC')
      .addOrderBy('voucher.status', 'ASC')
      .select([
        'voucher.id',
        'voucher.code',
        'voucher.type',
        'voucher.validFrom',
        'voucher.validTo',
        'voucher.status',
        'voucher.maxDiscountAmount',
        'voucher.percentDiscount',
      ])
      .take(limit)
      .skip(offset)
      .getManyAndCount();
  }

  async findOne(id: number) {
    return this.voucherRepo.findOneBy({ id });
  }

  //   async update(id: number, dto: UpdateVoucherDto) {
  //     await this.voucherRepo.update(id, dto);
  //     return this.findOne(id);
  //   }

  async remove(id: number) {
    return this.voucherRepo.delete(id);
  }
}
