import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // register user to backend databas

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: { access_token: string; result: any }) {
    return this.authService.login(signInDto.access_token);
  }
}
