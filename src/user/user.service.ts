import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return await this.userRepo.save(createUserDto);
  }

  async getOne(email: string) {
    return await this.userRepo.findOne({ where: { email: email } });
  }

  async findByEmail(email: string) {
    return await this.userRepo.findOne({ where: { email: email } });
  }
}
