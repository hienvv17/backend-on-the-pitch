import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as CryptoJS from 'crypto-js';
import moment from 'moment';
import { BookingDataInterface } from '../field-bookings/field-bookings.service';
import { v1 as uuidv1 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaymentGateway,
  PaymentsEntity,
  PaymentStatus,
} from '../entities/payment.entity';
import { Repository } from 'typeorm';
import { FieldBookingsEntity } from '../entities/field-bookings.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentsEntity)
    private paymentsRepository: Repository<PaymentsEntity>,
    @InjectRepository(FieldBookingsEntity)
    private fieldBookingsRepository: Repository<FieldBookingsEntity>,
  ) {}
  private readonly config = {
    appid: Number(process.env.ZALOPAY_APP_ID),
    key1: process.env.ZALOPAY_KEY1,
    key2: process.env.ZALOPAY_KEY2,
    endpoint: process.env.ZALOPAY_CREATE_ORDER_ENDPOINT,
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
      redirecturl: process.env.FRONT_END_URL,
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
      description: `Payment for order #${transID}`,
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
      await this.paymentsRepository.save(paymentList);
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
        const embedData = JSON.parse(data.embed_data);
        const apptransid = data.apptransid;
        const fieldBookingId = embedData.items[0].id;
        console.log('ZaloPay callback success data:', data);
        //
        // TODO: Update payment status in DB using `apptransid`
        const payment = await this.paymentsRepository.findOne({
          where: { appTransactionId: apptransid, fieldBookingId },
        });
        if (!payment) {
          result['returncode'] = 0;
          result['returnmessage'] = 'Payment not found';
          return result;
        }

        await this.paymentsRepository.update(
          { appTransactionId: payment.appTransactionId },
          {
            status: PaymentStatus.SUCCESS,
            transactionId: data.zp_trans_id,
          },
        );
        await this.fieldBookingsRepository.update(
          { id: payment.fieldBookingId },
          { status: 'PAID' },
        );

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
}
