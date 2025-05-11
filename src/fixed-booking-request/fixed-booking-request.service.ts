import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FixedBookingRequestEntity } from '../entities/fixing-booking-request.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FixedBookingRequestService {
  constructor(
    @InjectRepository(FixedBookingRequestEntity)
    private readonly fixedBookingRepo: Repository<FixedBookingRequestEntity>,
  ) {}

  async findAll() {
    return this.fixedBookingRepo.find();
  }

  async findOne(id: number) {
    return this.fixedBookingRepo.findOneBy({ id });
  }

  async create(data: Partial<FixedBookingRequestEntity>) {
    const entity = this.fixedBookingRepo.create(data);
    return await this.fixedBookingRepo.save(entity);
  }

  async update(id: number, updateData: Partial<FixedBookingRequestEntity>) {
    await this.fixedBookingRepo.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: number) {
    return this.fixedBookingRepo.delete(id);
  }
}
