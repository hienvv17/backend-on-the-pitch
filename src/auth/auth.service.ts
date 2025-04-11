import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { config as envConfig } from 'dotenv';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffsService } from '../staffs/staffs.service';
import { UsersService } from '../users/users.service';
envConfig();
@Injectable()
export class AuthService {
  constructor(
    private readonly admin: FirebaseAdmin,
    private usersService: UsersService,
    private staffsService: StaffsService,
  ) {}

  async login(access_token: string) {
    try {
      const app = this.admin.setup();
      const claims = await app.auth().verifyIdToken(access_token);
      let user = await this.usersService.findByEmail(claims.email);
      if (!user) {
        user = await this.usersService.create({
          email: claims.email,
          uid: claims.uid,
          fullName: claims.name,
          picture: claims.picture,
        });
      }
      return user;
    } catch (error) {
      throw new BadRequestException('Invalid token.');
    }
  }

  async staffLogin(access_token: string) {
    console.log('access_token', access_token);
    const app = this.admin.setup();
    const claims = await app.auth().verifyIdToken(access_token);
    const staff = await this.staffsService.findByEmail(claims.email);
    if (!staff) {
      throw new UnauthorizedException(
        'You have no access permission to this resource.',
      );
    }
    return staff;
  }
}
