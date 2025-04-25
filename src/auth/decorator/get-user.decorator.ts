import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export interface AuthUser {
  uid: string;
  email: string;
}

export const GetUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;

    // If no user (public route), return undefined or undefined field
    if (!user) throw new BadRequestException('You are not login!');
    return user[data];
  },
);
