import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { CreateStaffDto } from './dtos/create-staff.dto';
import moment from 'moment';
import { StaffEntity } from '../entities/staff.entity';
import { FirebaseAdmin } from '../firebase/firebase.service';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
    private readonly firebaseAdmin: FirebaseAdmin,
  ) {}

  async create(createStaffDto: CreateStaffDto): Promise<StaffEntity> {
    //admin can create staff all branch
    // manager can create staff only in his branch
    const existingStaff = await this.staffRepository.findOne({
      where: { email: createStaffDto.email },
    });
    if (existingStaff) {
      throw new Error('Staff already exists');
    }
    const admin = this.firebaseAdmin.setup();
    const newStaffData = await admin.auth().createUser({
      email: createStaffDto.email,
    });

    console.log('Successfully created new user:', newStaffData);
    const newStaff = await this.staffRepository.save(
      this.staffRepository.create({
        ...createStaffDto,
        uid: newStaffData.uid,
      }),
    );

    return newStaff;
  }

  async findAll(): Promise<StaffEntity[]> {
    return await this.staffRepository.find();
  }

  async remove(id: number): Promise<void> {
    const result = await this.staffRepository.update(
      { id: id },
      { isActive: false },
    );
    if (result.affected === 0) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return;
  }

  async findByEmail(email: string): Promise<StaffEntity> {
    const activeStaff = await this.staffRepository.findOne({
      where: {
        email: email,
        isActive: true,
        activeDate: LessThanOrEqual(new Date(moment().format('YYYY-MM-DD'))),
      },
      select: ['id', 'uid', 'email', 'phoneNumber', 'role'],
    });
    return activeStaff;
  }
}
