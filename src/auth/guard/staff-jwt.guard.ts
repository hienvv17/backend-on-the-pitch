import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAdmin } from '../../firebase/firebase.service';
import { StaffsService } from '../../staffs/staffs.service';

@Injectable()
export class StaffJwtGuard implements CanActivate {
  constructor(
    private staffsService: StaffsService,
    private readonly admin: FirebaseAdmin,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const idToken = request.headers['authorization'];

    if (!idToken) {
      // To do : Update with error code in the future
      throw new UnauthorizedException('Missing id token');
    }
    const app = this.admin.setup();
    let claims;
    try {
      claims = await app.auth().verifyIdToken(idToken);
      if (!claims) {
        throw new UnauthorizedException();
      }
    } catch (error) {
      if (error.code === 'auth/id-token-expired') {
        throw new UnauthorizedException(
          'Token has expired. Please log in again.',
        );
      }
      throw new UnauthorizedException('Invalid token.');
    }
    const staff = await this.staffsService.findByEmail(claims.email);
    if (!staff) {
      throw new UnauthorizedException('You has not been authorized');
    }
    request['staff'] = staff;
    return true;
  }
}
