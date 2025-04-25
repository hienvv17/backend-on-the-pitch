import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class BookingMailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendBookingSuccessEmail(to: string, bookingData: any) {
    //todo updat template that can not show
    await this.mailerService.sendMail({
      to,
      subject: `Booking Success - ${bookingData.code}`,
      template: 'booking-success',
      context: {
        code: bookingData.code,
        customerName: bookingData.customerName,
        fieldName: bookingData.fieldName,
        branchName: bookingData.branchName,
        bookingDate: bookingData.bookingDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        paymentMethod: 'VNPay',
      },
    });
    return;
  }
}
