import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { config as envConfig } from 'dotenv';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffService } from '../staff/staff.service';
import { UserService } from '../user/user.service';
envConfig();
@Injectable()
export class AuthService {
  constructor(
    private readonly admin: FirebaseAdmin,
    private userService: UserService,
    private staffService: StaffService,
  ) {}

  async login(access_token: string) {
    try {
      const app = this.admin.setup();
      const claims = await app.auth().verifyIdToken(access_token);
      let user = await this.userService.findByEmail(claims.email);
      if (!user) {
        user = await this.userService.create({
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
    const app = this.admin.setup();
    const claims = await app.auth().verifyIdToken(access_token);
    const staff = await this.staffService.findByEmail(claims.email);
    if (!staff) {
      throw new UnauthorizedException(
        'You have no access permission to this resource.',
      );
    }
    return staff;
  }
}
