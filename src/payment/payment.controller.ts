import { Controller, Post, Body, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ResponseService } from '../response/response.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('create')
  async createPayment(@Body() body: { amount: number; description: string }) {
    return this.paymentService.createZaloPayOrder([], 100);
  }

  @Post('callback')
  async handleZaloPayCallback(@Request() req: any, @Body() body: any) {
    console.log('ZaloPay Callback:');
    const result = await this.paymentService.handleZaloPayCallback(body);
    return this.responseService.successResponse({
      result,
    });
  }

  @Post('result')
  async handleZaloPayResult(@Request() req: any, @Body() body: any) {
    console.log('ZaloPay Callback:');
    const result = await this.paymentService.handleZaloPayCallback(body);
    return this.responseService.successResponse({
      result,
    });
  }

  @Post('refund')
  async handleRefund(@Body() body: any) {
    // Handle the refund request here
    console.log('ZaloPay Refund:', body);
    return { success: true };
  }
  @Post('check-status')
  async checkPaymentStatus(@Body() body: any) {
    // Handle the payment status check here
    console.log('ZaloPay Check Status:', body);
    return { success: true };
  }
  @Post('cancel')
  async cancelPayment(@Body() body: any) {
    // Handle the payment cancellation here
    console.log('ZaloPay Cancel:', body);
    return {
      success: false,
      message: 'Error creating ZaloPay order',
      error: 'error.message',
    };
  }
}
