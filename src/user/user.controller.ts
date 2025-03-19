import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ResponseService } from 'src/response/response.service';

@Controller('user')
export class UserController {
  constructor(
    private responseService: ResponseService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return this.responseService.successResponse({ user });
  }

  @Post('get-by-email')
  async getOne(@Body() body: { email: string }) {
    const user = await this.userService.getOne(body.email);
    return this.responseService.successResponse({ user });
  }
}
