import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserType } from '../types/current-user.type';

export const CurrentUser = createParamDecorator(
  (
    data: keyof CurrentUserType | undefined,
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user as CurrentUserType;

    if (!data) {
      return user;
    }

    return user[data];
  },
);