import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseService } from '../response/response.service';
import { SignInDto } from './dto/signIn.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private responseService: ResponseService,
  ) {}

  @Post('login')
  async signIn(@Body() signInDto: SignInDto) {
    const user = await this.authService.login(signInDto.access_token);
    return this.responseService.successResponse({ user }, 'Login successful');
  }
  @Post('staff/login')
  async staffSignin(@Body() signInDto: SignInDto) {
    const staff = await this.authService.staffLogin(signInDto.access_token);
    return this.responseService.successResponse({ staff }, 'Login successful');
  }
}
