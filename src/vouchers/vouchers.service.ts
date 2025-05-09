import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateVoucherDto } from './dto/create-voucher.dto';
import {
  VouchersEntity,
  VoucherStatusType,
  VoucherType,
} from '../entities/vouchers.entity';
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

  async findManageAll(
    limit: number,
    offset: number,
    status?: VoucherStatusType,
    type?: VoucherType,
    search?: string,
  ) {
    let query = this.voucherRepo
      .createQueryBuilder('v')
      .leftJoin('users', 'u', 'u.id = v.userId')
      .leftJoin('field_bookings', 'fb', 'fb.voucherCode = v.code')
      .select([
        'v.id "id"',
        'v.code "code"',
        'v.type "type"',
        'v.validFrom "validFrom"',
        'v.validTo "validTo"',
        'v.status "status"',
        'v.maxDiscountAmount "maxDiscountAmount"',
        'v.percentDiscount "percentDiscount"',
        'v.createdAt "createdAt"',
        'v.updatedAt "updatedAt"',
        'v.createBy "createBy"',
        'u.uid "uid"',
        'u.fullName "fullName"',
        'u.email "email"',
        'fb.code "bookingCode"',
        'fb.bookingDate "bookingDate"',
      ]);

    if (status) {
      query.andWhere('v.status = :status', { status });
    }
    if (type) {
      query.andWhere('v.type = :type', { type });
    }
    if (search) {
      query.andWhere(
        '(v.code ILIKE :search OR fb.code ILIKE :search OR u.email ILIKE :search OR u.phoneNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    query = query.orderBy('v.createdAt', 'DESC');

    const [items, count] = await Promise.all([
      query.limit(limit).offset(offset).getRawMany(),
      query.getCount(),
    ]);
    return {
      items,
      count,
    };
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
