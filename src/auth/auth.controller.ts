import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseService } from 'src/response/response.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private responseService: ResponseService,
  ) {}

  @Post('login')
  async signIn(@Body() signInDto: { access_token: string; result: any }) {
    const user = await this.authService.login(signInDto.access_token);
    return this.responseService.successResponse({ user }, 'Login successful');
  }
  @Post('staff/login')
  async staffSignin(@Body() signInDto: { access_token: string; result: any }) {
    const staff = await this.authService.staffLogin(signInDto.access_token);
    return this.responseService.successResponse({ staff }, 'Login successful');
  }
}
