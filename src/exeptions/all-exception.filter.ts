import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { failureResponse } from '@src/utils/response/response';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    // const request = context.getRequest<Request>();
    // General Error Message of Unhandled Exceptions
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let jsonResponse: string | object = failureResponse(
      'Interal Server Error',
      '500',
    );

    // Handled Exceptions
    if (exception.getStatus && exception.getResponse) {
      status = exception.getStatus();
      jsonResponse = exception.getResponse();
    }

    response.status(status).json(jsonResponse);
  }
}
