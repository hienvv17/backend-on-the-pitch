import { Controller, Post, Body, Request, Get, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ResponseService } from '../response/response.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('callback')
  async handleZaloPayCallback(@Request() req: any, @Body() body: any) {
    const result = await this.paymentService.handleZaloPayCallback(body);
    return this.responseService.successResponse({
      result,
    });
  }

  @Get('check-status')
  async queryOrder(
    @Query('appTransId') appTransId: string,
    @Query('status') status?: string,
  ) {
    const paymentInfo = await this.paymentService.queryZaloOrder(
      appTransId,
      status,
    );
    return this.responseService.successResponse({ paymentInfo });
  }
}
