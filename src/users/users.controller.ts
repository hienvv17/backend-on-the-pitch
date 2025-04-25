import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ResponseService } from '../response/response.service';
import { ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { UpdateUserDto } from './dtos/update-user.dto';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(
    private responseService: ResponseService,
    private readonly usersService: UsersService,
  ) { }

  @UseGuards(AdminJwtGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.responseService.successResponse({ user });
  }

  @UseGuards(AdminJwtGuard)
  @Post('get-by-email')
  async getOne(@Body() body: { email: string }) {
    const user = await this.usersService.getOne(body.email);
    return this.responseService.successResponse({ user });
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  async getPofile(@GetUser('uid') uid: string) {
    const user = await this.usersService.getOne(uid);
    return this.responseService.successResponse({ user });
  }

  @UseGuards(JwtGuard)
  @Post('update-profile')
  async updateProfile(@GetUser('uid') uid: string, @Body() dto: UpdateUserDto) {
    const users = await this.usersService.updateProfile(uid, dto);
    return this.responseService.successResponse({ users });
  }

  @UseGuards(AdminJwtGuard)
  @Post('mange')
  async getMangeAll() {
    const users = await this.usersService.getManageUser();
    return this.responseService.successResponse({ users });
  }
}
