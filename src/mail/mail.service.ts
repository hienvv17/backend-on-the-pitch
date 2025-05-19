import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class BookingMailService {
  constructor(private readonly mailerService: MailerService) { }

  async sendBookingSuccessEmail(to: string, bookingData: any) {
    //todo updat template that can not show
    await this.mailerService.sendMail({
      to,
      subject: `Đặt sân thành công - ${bookingData.bookingCode}`,
      template: 'booking-success',
      context: {
        bookingCode: bookingData.bookingCode,
        customerName: bookingData.customerName,
        fieldName: bookingData.fieldName,
        branchName: bookingData.branchName,
        bookingDate: bookingData.bookingDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        paymentMethod: 'ZaloPay',
        totalPrice: bookingData.totalPrice,
        originPrice: bookingData.originPrice,
        discountAmount: bookingData.discountAmount ?? 0,
        voucherCode: bookingData.voucherCode ?? '',
      },
    });
    return;
  }

  async sendRefundSuccessEmail(to: string, bookingData: any) {
    console.log('sendRefundSuccessEmail', to, bookingData);
    try {
      await this.mailerService.sendMail({
        to,
        subject: `Hoàn tiền thành công - ${bookingData.bookingCode}`,
        template: 'refund-approve',
        context: {
          customerName: bookingData.customerName,
          bookingCode: bookingData.bookingCode,
          refundAmount: bookingData.refundAmount,
          paymentMethod: 'ZaloPay',
        },
      });
    } catch (error) {
      console.error('ErrorSedningMail:', error);  
    }
  }

  async sendRefundRejectEmail(to: string, bookingData: any) {
    await this.mailerService.sendMail({
      to,
      subject: `Từ chối hoàn tiền - ${bookingData.bookingCode}`,
      template: 'refund-reject',
      context: {
        customerName: bookingData.customerName,
        bookingCode: bookingData.bookingCode,
        reason:
          bookingData.rejectReason ?? 'Không đáp ứng điều kiện hoàn tiền.',
      },
    });
    return;
  }
}
