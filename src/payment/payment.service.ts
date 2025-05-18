import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as CryptoJS from 'crypto-js';
import moment from 'moment';
import { BookingDataInterface } from '../field-bookings/field-bookings.service';
// import { v1 as uuidv1 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaymentGateway,
  PaymentsEntity,
  PaymentStatus,
} from '../entities/payment.entity';
import { Repository } from 'typeorm';
import {
  FieldBookingsEntity,
  FieldBookingStatus,
} from '../entities/field-bookings.entity';
import * as qs from 'qs';
import { BookingMailService } from '../mail/mail.service';
import { RefundsEntity } from '../entities/refund.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentsEntity)
    private paymentsRepository: Repository<PaymentsEntity>,
    @InjectRepository(FieldBookingsEntity)
    private fieldBookingsRepository: Repository<FieldBookingsEntity>,
    private readonly mailerService: BookingMailService,
  ) {}
  private readonly config = {
    appid: Number(process.env.ZALOPAY_APP_ID),
    key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
    key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
    endpoint: process.env.ZALOPAY_CREATE_ORDER_ENDPOINT,
    queryEndpoint: process.env.ZALOPAY_QUERY_ENDPOINT,
    refundEndpoint: process.env.ZALOPAY_REFUND_ENDPOINT,
    queryRefundEndpoint: process.env.ZALOPAY_QUERY_REFUND_ENDPOINT,
  };

  async createZaloPayOrder(
    bookingInfo: BookingDataInterface[],
    amount: number,
  ) {
    const items = [...bookingInfo];
    const transID = Math.floor(Math.random() * 1000000);
    const appTransId = `${moment().format('YYMMDD')}_${transID}`;
    const appTime = Date.now();
    const embedData = {
      redirecturl: 'https://on-the-pitch.vercel.app/payment-result',
      items: items,
    };

    const order = {
      app_id: this.config.appid,
      app_trans_id: appTransId,
      app_user: 'demo',
      app_time: appTime,
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embedData),
      amount,
      description: `Payment for booking ${bookingInfo[0].code} #${transID}`,
      bank_code: 'zalopayapp',
      callback_url:
        'https://develop-backend-on-the-pitch.vercel.app/payment/callback',
    };

    // Create MAC
    const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order['mac'] = CryptoJS.HmacSHA256(data, this.config.key1).toString();

    try {
      const response = await axios.post(this.config.endpoint, null, {
        params: order,
      });
      const paymentList = bookingInfo.map((item) => ({
        fieldBookingId: item.id,
        amount: item.totalPrice,
        appTransactionId: appTransId,
        orderUrl: response.data.order_url,
        gateway: PaymentGateway.ZALOPAY,
        status: PaymentStatus.PENDING,
      }));
      const nowPlus15Mins = new Date(Date.now() + 15 * 60 * 1000);
      await Promise.all([
        this.paymentsRepository.save(paymentList),
        this.fieldBookingsRepository.update(
          { id: bookingInfo[0].id },
          { latestPaymentDate: nowPlus15Mins },
        ),
      ]);

      return response.data;
    } catch (error) {
      console.error('ZaloPay create Order error:', error.message);
      throw new Error('Error creating ZaloPay order');
    }
  }

  async handleZaloPayCallback(body: any): Promise<any> {
    const result: Record<string, any> = {};

    try {
      const dataStr = body.data;
      const reqMac = body.mac;

      const mac = CryptoJS.HmacSHA256(
        dataStr,
        process.env.ZALOPAY_KEY2,
      ).toString();

      if (reqMac !== mac) {
        result['returncode'] = -1;
        result['returnmessage'] = 'mac not equal';
      } else {
        const data = JSON.parse(dataStr);
        console.log('ZaloPay callback data:', data);
        const apptransid = data.apptransid;
        // TODO: Update payment status in DB using `apptransid`
        const payment = await this.paymentsRepository
          .createQueryBuilder('payment')
          .leftJoin('field_bookings', 'fb', 'fb.id = payment.fieldBookingId')
          .leftJoin('users', 'u', 'u.id = fb.userId')
          .leftJoin('sport_fields', 'sf', 'sf.id = fb.sportFieldId')
          .leftJoin('branches', 'b', 'b.id = sf.branchId')
          .where('payment.appTransactionId = :appTransId', {
            appTransId: apptransid,
          })
          .select([
            'payment.id "id"',
            'payment.appTransactionId "appTransactionId"',
            'payment.transactionId "transactionId"',
            'payment.fieldBookingId "fieldBookingId"',
            'payment.status "status"',
            'fb.code "bookingCode"',
            'u.fullName "customerName"',
            'u.email "userEmail"',
            'sf.name "fieldName"',
            'b.name "branchName"',
            `TO_CHAR(fb.bookingDate, 'YYYY-MM-DD') "bookingDate"`,
            'fb.startTime "startTime"',
            'fb.endTime "endTime"',
            'fb.totalPrice "totalPrice"',
            'fb.originPrice "originPrice"',
            'fb.status "status"',
            'fb.sentMail "sentMail"',
            'fb.totalRetrySendMail "totalRetrySendMail"',
            'fb.discountAmount "discountAmount"',
            'fb.voucherCode "voucherCode"',
          ])
          .getRawOne();

        if (!payment) {
          result['returncode'] = 0;
          result['returnmessage'] = 'Payment not found';
          return result;
        }

        //Update payment status
        if (payment.status !== PaymentStatus.SUCCESS) {
          await this.paymentsRepository.update(
            { appTransactionId: payment.appTransactionId },
            {
              status: PaymentStatus.SUCCESS,
              transactionId: data.zp_trans_id,
            },
          );
          await this.fieldBookingsRepository.update(
            { id: payment.fieldBookingId },
            { status: FieldBookingStatus.PAID },
          );
        }
        if (!payment.sentMail) {
          try {
            await this.mailerService
              .sendBookingSuccessEmail(payment.userEmail, payment)
              .then(() => {
                this.fieldBookingsRepository.update(
                  { id: payment.fieldBookingId },
                  { sentMail: true },
                );
              });
          } catch (error) {
            // Handle email sending error
            await this.fieldBookingsRepository.update(
              { id: payment.fieldBookingId },
              { totalRetrySendMail: Number(payment.totalRetrySendMail) + 1 },
            );
            console.error('Error sending email:', error);
          }
        }
        result['returncode'] = 1;
        result['returnmessage'] = 'success';
      }
    } catch (err) {
      console.log('Error handling ZaloPay callback:', err);
      result['returncode'] = 0;
      result['returnmessage'] = err.message;
    }

    return result;
  }

  async queryZaloOrder(appTransId: string, status?: string): Promise<any> {
    const postData = {
      app_id: this.config.appid,
      app_trans_id: appTransId,
    };

    const data = `${postData.app_id}|${postData.app_trans_id}|${this.config.key1}`;
    postData['mac'] = CryptoJS.HmacSHA256(data, this.config.key1).toString();
    const payment = await this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoin('field_bookings', 'fb', 'fb.id = payment.fieldBookingId')
      .leftJoin('users', 'u', 'u.id = fb.userId')
      .leftJoin('sport_fields', 'sf', 'sf.id = fb.sportFieldId')
      .leftJoin('branches', 'b', 'b.id = sf.branchId')
      .where('payment.appTransactionId = :appTransId', { appTransId })
      .select([
        'payment.id "id"',
        'payment.appTransactionId "appTransactionId"',
        'payment.transactionId "transactionId"',
        'payment.fieldBookingId "fieldBookingId"',
        'payment.status "status"',
        'fb.code "bookingCode"',
        'u.fullName "customerName"',
        'u.email "userEmail"',
        'sf.name "fieldName"',
        'b.name "branchName"',
        `TO_CHAR(fb.bookingDate, 'YYYY-MM-DD') "bookingDate"`,
        'fb.startTime "startTime"',
        'fb.endTime "endTime"',
        'fb.totalPrice "totalPrice"',
        'fb.originPrice "originPrice"',
        'fb.status "status"',
        'fb.sentMail "sentMail"',
        'fb.discountAmount "discountAmount"',
        'fb.voucherCode "voucherCode"',
        'fb.sentMail "sentMail"',
        'fb.totalRetrySendMail "totalRetrySendMail"',
      ])
      .getRawOne();

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    try {
      const response = await axios.post(
        this.config.queryEndpoint,
        qs.stringify(postData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      const data = response.data;
      console.log('ZaloPay query response:', data);
      if (data.return_code !== 1) {
        // update payment status before
        if (payment.status !== PaymentStatus.PENDING) {
          return {
            paymentSuccess: payment.status == PaymentStatus.SUCCESS,
            bookingCode: payment.bookingCode,
          };
        }

        if (!status && data.return_code == 3) {
          //cron job run
          return;
        }
        // cancel payment from user && fail payment
        if (!!status && status == '-49' && data.return_code == 3) {
          await this.paymentsRepository.update(
            { appTransactionId: payment.appTransactionId },
            {
              status: PaymentStatus.CANCELLED,
            },
          );
        }
        if (data.return_code == 2) {
          await this.paymentsRepository.update(
            { appTransactionId: payment.appTransactionId },
            {
              status: PaymentStatus.FAILED,
            },
          );
        }
        await this.fieldBookingsRepository.update(
          { id: payment.fieldBookingId },
          { status: FieldBookingStatus.CANCELLED },
        );
        return { paymentSuccess: false, bookingCode: payment.bookingCode };
      }
      if (data.return_code == 1) {
        if (payment.status !== PaymentStatus.SUCCESS) {
          await this.paymentsRepository.update(
            { appTransactionId: payment.appTransactionId },
            {
              status: PaymentStatus.SUCCESS,
              transactionId: data.zp_trans_id,
            },
          );
          await this.fieldBookingsRepository.update(
            { id: payment.fieldBookingId },
            { status: FieldBookingStatus.PAID },
          );
        }
        if (!payment.sentMail) {
          try {
            await this.mailerService
              .sendBookingSuccessEmail(payment.userEmail, payment)
              .then(() => {
                this.fieldBookingsRepository.update(
                  { id: payment.fieldBookingId },
                  { sentMail: true },
                );
              });
          } catch (error) {
            await this.fieldBookingsRepository.update(
              { id: payment.fieldBookingId },
              { totalRetrySendMail: Number(payment.totalRetrySendMail) + 1 },
            );

            // gentally handle error not crash system
            console.error('Error sending email:', error);
          }
        }
        return { paymentSuccess: true, bookingCode: payment.bookingCode };
      }

      return;
    } catch (error) {
      console.error(
        'ZaloPay Query Error:',
        error?.response?.data || error.message,
      );
      throw error;
    }
  }

  async refund(
    transactionId: string,
    amount: number,
    description: string,
  ): Promise<any> {
    const timestamp = Date.now();
    const uid = Math.floor(1e9 + Math.random() * 9e9).toString();
    const m_refund_id = `${moment().format('YYMMDD')}_${
      this.config.appid
    }_${uid}`;
    const params: any = {
      app_id: this.config.appid,
      m_refund_id,
      timestamp,
      zp_trans_id: transactionId,
      amount: amount,
      description,
    };

    // app_id|zp_trans_id|amount|description|timestamp
    const dataToHash = `${params.app_id}|${params.zp_trans_id}|${params.amount}|${params.description}|${params.timestamp}`;
    console.log('ZaloPay refund data to hash:', dataToHash);
    params['mac'] = CryptoJS.HmacSHA256(
      dataToHash,
      this.config.key1,
    ).toString();
    console.log('ZaloPay refund params:', params);

    try {
      const response = await axios.post(
        'https://sb-openapi.zalopay.vn/v2/refund',
        null,
        {
          params,
        },
      );
      console.log('ZaloPay refund response:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        'ZaloPay refund error:',
        error.response?.data || error.message,
      );
    }
  }

  async queryRefundStatus(transactionId: string): Promise<any> {
    const timestamp = Date.now();
    const data = `${this.config.appid}|${transactionId}|${timestamp}`;
    const mac = CryptoJS.HmacSHA256(data, this.config.key1).toString();

    const params = {
      app_id: this.config.appid,
      m_refund_id: transactionId,
      timestamp,
      mac,
    };

    try {
      const response = await axios.post(this.config.endpoint, null, { params });
      return response.data;
    } catch (error) {
      console.error(
        'ZaloPay query refund error:',
        error.response?.data || error.message,
      );
      return {
        return_code: 2,
        return_message: 'Failed to query refund status',
        data: null,
      };
    }
  }

  async getPaymentByBookingId(
    bookingId: number,
  ): Promise<PaymentsEntity | null> {
    return await this.paymentsRepository.findOne({
      where: { fieldBookingId: bookingId },
    });
  }
}
