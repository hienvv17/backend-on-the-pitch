import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { FirebaseAdmin } from 'src/firebase/firebase.service';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private readonly firebaseAdmin: FirebaseAdmin,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const admin = this.firebaseAdmin.setup();
    let existingFirebaseUser: UserRecord = null;
    const existingUser = await this.userRepo.findOne({
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
    return await this.userRepo.save({
      createUserDto,
      uid: existingFirebaseUser.uid,
    });
  }

  async getOne(email: string) {
    return await this.userRepo.findOne({ where: { email: email } });
  }

  async findByEmail(email: string) {
    return await this.userRepo.findOne({ where: { email: email } });
  }
}
