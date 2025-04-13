import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class BookingMailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendBookingSuccessEmail(to: string, bookingData: any) {
    //todo updat template that can not show
    await this.mailerService.sendMail({
      to,
      subject: 'Booking Success',
      template: './booking-success', // e.g., templates/booking-success.hbs
      context: {
        customerName: bookingData.customerName ,
        serviceName: bookingData.serviceName,
        bookingDate: bookingData.bookingDate,
        branchName: bookingData.branchName,
      },
    });
    return;
  }
}
