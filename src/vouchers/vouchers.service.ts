import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';

import { CreateVoucherDto } from './dto/create-voucher.dto';
import {
  VouchersEntity,
  VoucherStatus,
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
    order: string,
    sortKey?: string,
    status?: VoucherStatusType,
    type?: VoucherType,
    search?: string,
  ) {
    let query = this.voucherRepo
      .createQueryBuilder('voucher')
      .leftJoin('users', 'u', 'u.id = voucher.userId')
      .leftJoin('field_bookings', 'fb', 'fb.voucherCode = voucher.code')
      .select([
        'voucher.id "id"',
        'voucher.code "code"',
        'voucher.type "type"',
        `TO_CHAR(voucher.validFrom, 'YYYY-MM-DD') "validFrom"`,
        `TO_CHAR(voucher.validTo, 'YYYY-MM-DD') "validTo"`,
        'voucher.status "status"',
        'voucher.maxDiscountAmount "maxDiscountAmount"',
        'voucher.percentDiscount "percentDiscount"',
        'voucher.createdAt "createdAt"',
        'voucher.updatedAt "updatedAt"',
        'voucher.createdBy "createdBy"',
        'u.uid "uid"',
        'u.fullName "fullName"',
        'u.email "email"',
        'fb.code "bookingCode"',
        'fb.bookingDate "bookingDate"',
        'voucher.minBookingAmount "minBookingAmount"',
      ]);

    if (status) {
      query.andWhere('voucher.status = :status', { status });
    }
    if (type) {
      query.andWhere('voucher.type = :type', { type });
    }
    if (search) {
      query.andWhere(
        '(voucher.code ILIKE :search OR fb.code ILIKE :search OR u.email ILIKE :search OR u.phoneNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    const sortBy = sortKey || 'voucher.createdAt';
    query = query.orderBy(sortBy, order as any);

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
    const query = this.voucherRepo
      .createQueryBuilder('voucher')
      .leftJoin('users', 'user', 'user.id = voucher.userId')
      .where('user.uid = :uid', { uid })
      .andWhere('voucher.validTo > NOW()')
      .andWhere('voucher.status = :status', {
        status: VoucherStatus.ACTIVE,
      })
      .orderBy('voucher.createdAt', 'DESC')
      .addOrderBy('voucher.status', 'ASC')
      .select([
        'voucher.id "id"',
        'voucher.code "code"',
        `TO_CHAR(voucher.validFrom, 'YYYY-MM-DD') "validFrom"`,
        `TO_CHAR(voucher.validTo, 'YYYY-MM-DD') "validTo"`,
        'voucher.status "status"',
        'voucher.maxDiscountAmount "maxDiscountAmount"',
        'voucher.percentDiscount  "percentDiscount"',
        'voucher.minBookingAmount "minBookingAmount"',
        'voucher.createdAt "createdAt"',
      ]);
    const [items, count] = await Promise.all([
      query.limit(limit).offset(offset).getRawMany(),
      query.getCount(),
    ]);
    return {
      items,
      count,
    };
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

  async validate(uid: string, code: string) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const valid = await this.voucherRepo.findOne({
      where: {
        code: code,
        status: VoucherStatus.ACTIVE,
        user: {
          uid,
        },
        validTo: MoreThanOrEqual(currentDate),
      },
    });
    if (!valid) {
      throw new BadRequestException('Voucher is not valid');
    }
    return valid;
  }

  async checkActive(code: string) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const valid = await this.voucherRepo.findOne({
      where: {
        code: code,
        status: VoucherStatus.ACTIVE,
        validTo: MoreThanOrEqual(currentDate),
      },
    });
    if (!valid) {
      throw new BadRequestException('Voucher is not valid');
    }
    return valid;
  }

  async usedVoucher(voucherCode: string) {
    return this.voucherRepo.update(
      { code: voucherCode },
      { status: VoucherStatus.USED },
    );
  }

  async undoUseVoucher(voucherCode: string) {
    return this.voucherRepo.update(
      { code: voucherCode },
      { status: VoucherStatus.ACTIVE },
    );
  }
}
