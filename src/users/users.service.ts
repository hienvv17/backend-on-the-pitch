import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from '../entities/users.entity';
import { FirebaseAdmin } from 'src/firebase/firebase.service';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepo: Repository<UsersEntity>,
    private readonly firebaseAdmin: FirebaseAdmin,
  ) {}

  async create(createUserDto: CreateUserDto) {
    console.log(createUserDto, 'check data create user')
    console.log('check create user')
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

  async getOne(email: string) {
    return await this.usersRepo.findOne({ where: { email: email } });
  }

  async findByEmail(email: string) {
    return await this.usersRepo.findOne({ where: { email: email } });
  }
}
