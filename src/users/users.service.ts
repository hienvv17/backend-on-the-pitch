import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from '../entities/users.entity';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepo: Repository<UsersEntity>,
    private readonly firebaseAdmin: FirebaseAdmin,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const admin = this.firebaseAdmin.setup();
    let existingFirebaseUser: UserRecord = null;
    const existingUser = await this.usersRepo.findOne({
      where: { email: createUserDto.email },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        uid: true,
      },
    });
    if (existingUser) {
      return existingUser;
    }
    try {
      existingFirebaseUser = await admin
        .auth()
        .getUserByEmail(createUserDto.email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        existingFirebaseUser = await admin.auth().createUser({
          email: createUserDto.email,
        });
      } else {
        throw error;
      }
    }
    return await this.usersRepo.save({
      ...createUserDto,
      uid: existingFirebaseUser.uid,
    });
  }

  async getProfile(email: string) {
    return await this.usersRepo.findOne({ where: { email: email } });
  }

  async updateProfile(uid: string, dto: UpdateUserDto) {
    await this.usersRepo.update(
      { uid: uid },
      { ...dto, updatedAt: new Date() },
    );
    return;
  }

  async getOne(uid: string) {
    return await this.usersRepo.findOne({
      where: { uid: uid },
      select: {
        fullName: true,
        email: true,
        phoneNumber: true,
        image: true,
      },
    });
  }

  async findByEmail(email: string) {
    return await this.usersRepo.findOne({ where: { email: email } });
  }

  async getManageUser() {
    const users = await this.usersRepo
      .createQueryBuilder('u')
      .leftJoin('field_bookings', 'fb', 'fb.user_id = u.id')
      .select('u.id', 'id')
      .addSelect('u.email', 'email')
      .addSelect('u.full_name', 'fullName')
      .addSelect('COUNT(fb.id) "totalBookings"')
      .addSelect(
        `COUNT(CASE WHEN fb.status = 'PAID' THEN 1 END)`,
        'paidBookings',
      )
      .addSelect(
        `COUNT(CASE WHEN fb.status = 'CANCELLED' THEN 1 END)`,
        'cancelledBookings',
      )
      .addSelect('u.created_at', 'createdAt')
      .addSelect('u.updated_at', 'updatedAt')
      .groupBy('u.id')
      .getRawMany();

    const result = users.map((item) => ({
      ...item,
      totalBookings: Number(item.totalBookings),
      pendingBookings: Number(item.totalBookings) - Number(item.paidBookings),
      paidBookings: Number(item.paidBookings),
      cancelledBookings: Number(item.cancelledBookings),
    }));
    return result;
  }
}
