import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  Between,
  EntityManager,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
} from 'typeorm';
import { Booking } from './entities/booking.entity';
import { User } from 'src/user/entities/user.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { BookingListVo } from './vo/booking-list.vo';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class BookingService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  async initData() {
    const user1 = await this.entityManager.findOneBy(User, {
      id: 1,
    });
    const user2 = await this.entityManager.findOneBy(User, {
      id: 2,
    });

    const room1 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 3,
    });
    const room2 = await await this.entityManager.findOneBy(MeetingRoom, {
      id: 4,
    });

    const booking1 = new Booking();
    booking1.room = room1 as MeetingRoom;
    booking1.user = user1 as User;
    booking1.startTime = new Date();
    booking1.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking1);

    const booking2 = new Booking();
    booking2.room = room2 as MeetingRoom;
    booking2.user = user2 as User;
    booking2.startTime = new Date();
    booking2.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking2);

    const booking3 = new Booking();
    booking3.room = room1 as MeetingRoom;
    booking3.user = user2 as User;
    booking3.startTime = new Date();
    booking3.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking3);

    const booking4 = new Booking();
    booking4.room = room2 as MeetingRoom;
    booking4.user = user1 as User;
    booking4.startTime = new Date();
    booking4.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking4);
  }

  async list(
    pageNo: number,
    pageSize: number,
    username: string,
    meetingRoomName: string,
    meetingRoomPosition: string,
    bookingTimeRangeStart?: number,
    bookingTimeRangeEnd?: number,
  ) {
    const condition: Record<string, any> = {};
    if (username) {
      condition.user = {
        username: Like(`%${username}%`),
      };
    }
    if (meetingRoomName) {
      condition.room = {
        name: Like(`%${meetingRoomName}%`),
      };
    }
    if (meetingRoomPosition) {
      if (!condition.room) {
        condition.room = {};
      }
      condition.room.location = Like(`%${meetingRoomPosition}%`);
    }

    if (bookingTimeRangeStart && bookingTimeRangeEnd) {
      condition.startTime = Between(
        new Date(Number(bookingTimeRangeStart)),
        new Date(Number(bookingTimeRangeEnd)),
      );
    } else if (bookingTimeRangeStart) {
      const endTime = Number(bookingTimeRangeStart) + 60 * 60 * 1000;
      condition.startTime = Between(
        new Date(Number(bookingTimeRangeStart)),
        new Date(endTime),
      );
    }
    const [bookings, totalCount] = await this.entityManager.findAndCount(
      Booking,
      {
        where: condition,
        relations: ['user', 'room'],
        skip: (pageNo - 1) * pageSize,
        take: pageSize,
      },
    );

    return {
      bookings: bookings.map((item) => {
        const { user, ...bookingWithoutPassword } = item;
        const { password, ...userWithoutPassword } = user;
        return {
          ...bookingWithoutPassword,
          user: userWithoutPassword,
        };
      }),
      totalCount,
    };
  }

  async add(bookingDto: CreateBookingDto, userId: number) {
    const meetingRoom = await this.entityManager.findOneBy(MeetingRoom, {
      id: bookingDto.meetingRoomId,
    });

    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }

    const user = await this.entityManager.findOneBy(User, {
      id: userId,
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    const booking = new Booking();
    booking.room = meetingRoom;
    booking.user = user;
    booking.startTime = new Date(bookingDto.startTime);
    booking.endTime = new Date(bookingDto.endTime);

    const res = await this.entityManager.findOneBy(Booking, {
      room: {
        id: meetingRoom.id,
      },
      startTime: LessThanOrEqual(booking.startTime),
      endTime: MoreThanOrEqual(booking.endTime),
    });

    if (res) {
      throw new BadRequestException('该时间段已被预定');
    }

    await this.entityManager.save(Booking, booking);
  }

  async apply(id: number) {
    await this.entityManager.update(Booking, id, {
      status: '审批通过',
    });
    return 'success';
  }

  async reject(id: number) {
    await this.entityManager.update(Booking, id, {
      status: '审批驳回',
    });
    return 'success';
  }

  async unbind(id: number) {
    await this.entityManager.update(Booking, id, {
      status: '已解除',
    });
    return 'success';
  }

  async urge(id: number) {
    const flag = await this.redisService.get(`urge_${id}`);
    console.log('flag', flag);
    if (flag) {
      return '半小时只能催办一次，请耐心等待';
    }

    let email = await this.redisService.get('admin_email');
    if (!email) {
      const admin = await this.entityManager.findOne(User, {
        select: {
          email: true,
        },
        where: {
          isAdmin: true,
        },
      });
      if (!admin) {
        throw new BadRequestException('管理员不存在');
      }
      email = admin.email;
      await this.redisService.set('admin_email', email);
    }
    this.emailService.sendMail({
      to: email,
      subject: '会议预约催办提醒',
      html: '您的会议预约已被催办，请及时处理',
    });
    await this.redisService.set(`urge_${id}`, '1', 60 * 30);
    return '催办成功';
  }
}
