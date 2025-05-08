import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateVoucherDto } from './dto/create-voucher.dto';
import { VouchersEntity, VoucherType } from '../entities/vouchers.entity';
import { VoucherConfig } from '../entities/voucher-config.entity';
import { CreateVoucherConfigDto } from './dto/create-voucher-config';
import { UpdateVoucherConfigDto } from './dto/update-voucher-config';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(VouchersEntity)
    private readonly voucherRepo: Repository<VouchersEntity>,
    @InjectRepository(VoucherConfig)
    private readonly voucherConfigRepo: Repository<VoucherConfig>,
  ) {}

  async create(dto: CreateVoucherDto) {
    const voucher = this.voucherRepo.create(dto);
    return this.voucherRepo.save(voucher);
  }

  async createManual(dto: CreateVoucherDto) {
    const voucher = this.voucherRepo.create({
      ...dto,
      type: VoucherType.MANUAL,
    });
    return this.voucherRepo.save(voucher);
  }

  async createConfig(dto: CreateVoucherConfigDto) {
    const voucher = this.voucherConfigRepo.create(dto);
    return this.voucherConfigRepo.save(voucher);
  }

  async findManageAll() {
    return this.voucherRepo.find();
  }

  async findAllConfig() {
    return this.voucherConfigRepo.find();
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

  async removeConfig(id: number) {
    return this.voucherConfigRepo.delete(id);
  }

  async updateConfig(id: number, dto: UpdateVoucherConfigDto) {
    return await this.voucherConfigRepo.update(id, dto);
  }
}
