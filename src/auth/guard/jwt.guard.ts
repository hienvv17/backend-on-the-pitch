import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAdmin } from '@src/firebase/firebase.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly admin: FirebaseAdmin) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const idToken = request.headers['authorization'];

    if (!idToken) {
      // To do : Update with error code in the future
      throw new UnauthorizedException('Missing id token');
    }
    const app = this.admin.setup();
    try {
      const claims = await app.auth().verifyIdToken(idToken);
      if (!claims) {
        throw new UnauthorizedException();
      }
      const user = { email: claims.email, uid: claims.uid };
      request['user'] = user;
      return true;
    } catch (error) {
      if (error.code === 'auth/id-token-expired') {
        throw new UnauthorizedException(
          'Token has expired. Please log in again.',
        );
      }
      throw new UnauthorizedException('Invalid token.');
    }
  }
}
