import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class StatisticService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  async userBookingCount(startTime: string, endTime: string) {
    const res = await this.entityManager
      .createQueryBuilder(Booking, 'b')
      .select('u.id', 'userId')
      .addSelect('u.username', 'username')
      .leftJoin(User, 'u', 'b.userId = u.id')
      .addSelect('count(1)', 'bookingCount')
      .where('b.startTime between :time1 and :time2', {
        time1: startTime,
        time2: endTime,
      })
      .groupBy('b.userId')
      .getRawMany();

    return res;
  }

  async meetingRoomUsedCount(startTime: string, endTime: string) {
    const res = await this.entityManager
      .createQueryBuilder(Booking, 'b')
      .select('m.id', 'meetingRoomId')
      .addSelect('m.name', 'meetingRoomName')
      .addSelect('count(1)', 'usedCount')
      .leftJoin(MeetingRoom, 'm', 'm.id = b.roomId')
      .where('b.startTime between :time1 and :time2', {
        time1: startTime,
        time2: endTime,
      })
      .groupBy('b.roomId')
      .getRawMany();
    return res;
  }
}
