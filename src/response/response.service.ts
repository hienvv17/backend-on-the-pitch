import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService {
  successResponse = (
    response: Record<string, any> = [],
    message: string = 'Success',
  ) => {
    return {
      success: true,
      ...response,
      message,
    };
  };

  failureResponse = (message: string | [], code?: string) => {
    return {
      success: false,
      error: {
        message,
        code,
      },
    };
  };
}
