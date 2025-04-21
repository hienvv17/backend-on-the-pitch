import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ResponseService } from '../response/response.service';

@Controller('users')
export class UserController {
  constructor(
    private responseService: ResponseService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.responseService.successResponse({ user });
  }

  @Post('get-by-email')
  async getOne(@Body() body: { email: string }) {
    const user = await this.usersService.getOne(body.email);
    return this.responseService.successResponse({ user });
  }
}
