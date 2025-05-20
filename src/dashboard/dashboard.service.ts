import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from '../entities/users.entity';
import { FieldBookingsEntity, FieldBookingStatus } from '../entities/field-bookings.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,

    @InjectRepository(FieldBookingsEntity)
    private bookingRepository: Repository<FieldBookingsEntity>,
  ) { }

  async getDashboardData(year?: number, month?: number) {
    //if not year and month return all data current year
    const _year = year || new Date().getFullYear();
    const _month = month || new Date().getMonth() + 1;

    const startDate = new Date(_year, _month - 1, 1);
    const endDate = new Date(_year, _month, 0, 23, 59, 59);

    // get booking group by bookingDate, a by status
    const bookingsByDateAndStatus = await this.bookingRepository
      .createQueryBuilder('booking')
      .select(`TO_CHAR(booking.bookingDate, 'YYYY-MM-DD') "bookingDate"`,)
      .addSelect('booking.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('booking.bookingDate BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('booking.bookingDate')
      .addGroupBy('booking.status')
      .orderBy('booking.bookingDate', 'ASC')
      .getRawMany();


    // 2. Group by sportCategory
    const bookingsBySportCategory = await this.bookingRepository
      .createQueryBuilder('booking')
      .innerJoin('sport_fields', 'sportField', 'sportField.id = booking.sportFieldId')
      .innerJoin('sport_categories', 'sportCategory', 'sportCategory.id = sportField.sportCategoryId')
      .select('sportCategory.id', 'sportCategoryId')
      .addSelect('sportCategory.name', 'sportCategoryName')
      .addSelect('COUNT(*)', 'count')
      .where('booking.bookingDate BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('sportCategory.id')
      .orderBy('"count"', 'DESC')
      .getRawMany();


    // 3. Top 10 most booked hours (startTime)
    const bookingsByHour = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('booking.startTime', 'startTime')
      .addSelect('COUNT(*)', 'count')
      .where('booking.bookingDate BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('booking.startTime')
      .orderBy('"count"', 'DESC')
      .limit(5)
      .getRawMany();

    // 4. Top 10 users with most bookings
    const topUsers = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('users', 'user', 'user.id = booking.userId')
      .select('user.id', 'userId')
      .addSelect('user.fullName', 'userName')
      .addSelect('user.email', 'userEmail')
      .addSelect('COUNT(*)', 'count')
      .where('booking.bookingDate BETWEEN :start AND :end', { start: startDate, end: endDate })
      .where('booking.status IN (:...status)', { status: [FieldBookingStatus.PAID, FieldBookingStatus.CHECK_IN] })
      .groupBy('user.id')
      .addGroupBy('user.fullName')
      .addGroupBy('user.email')
      .orderBy('"count"', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      bookingsByDateAndStatus,
      bookingsBySportCategory,
      bookingsByHour,
      topUsers,
    };
    // end of month
    // bookingDate : yyyy-mm-dd
    // startTime: hh:mm
    // endTime: hh:mm
    //status: PAID, PENDING, CANCELLED, CHECK_IN
    // get all booking group by bookingDate, a by status
    // get all booking group by sportCategory
    // get top 10 most booking hour
    // get top 10 user  have most booking in this range 
  }
}
