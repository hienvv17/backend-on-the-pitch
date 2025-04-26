import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { VouchersEntity } from '../entities/vouchers.entity';
import { UpdateVoucherDto } from './dto/update-voucher.dto';


@Injectable()
export class VouchersService {
    constructor(
        @InjectRepository(VouchersEntity)
        private readonly voucherRepo: Repository<VouchersEntity>,
    ) { }

    async create(dto: CreateVoucherDto) {
        const voucher = this.voucherRepo.create(dto);
        return this.voucherRepo.save(voucher);
    }

    async getPersonalAll(uid: string) {
        return this.voucherRepo
            .createQueryBuilder('vc')
            .leftJoin('users', 'u', 'vc.user_id = u.id')
            .where('u.uid = :uid', { uid })
            .select([
                'vc.id AS id',
                'vc.code AS voucherCode',
                'vc.type AS type',
                'vc.status AS status',
                'vc.discount_amount AS discountAmount',
                'vc.expire_date AS expireDate',
                'vc.created_at AS createdAt',
                'vc.updated_at AS updatedAt',
                'u.email AS userEmail',
            ])
            .orderBy('vc.expire_date', 'ASC')
            .getRawMany();
    }

    async getMangeAll() {
        return this.voucherRepo.findAndCount()
    }

    async findOne(id: number) {
        const voucher = await this.voucherRepo.findOneBy({ id });
        if (!voucher) throw new NotFoundException('Voucher not found');
        return voucher;
    }

    async useVoucher(id: number, dto: UpdateVoucherDto) {
        await this.findOne(id); // ensures existence
        await this.voucherRepo.update(id, dto);
        return this.findOne(id);
    }

    async unActive(id: number, dto: UpdateVoucherDto) {
        await this.findOne(id); // ensures existence
        await this.voucherRepo.update(id, dto);
        return this.findOne(id);
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.voucherRepo.delete(id);
    }
}
