import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { EntityManager, Like, Repository } from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { MeetingRoomListVo } from './vo/meeting-room-list.vo';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private repository: Repository<MeetingRoom>;

  @InjectEntityManager()
  private entityManager: EntityManager;

  initData() {
    const room1 = new MeetingRoom();
    room1.name = '木星';
    room1.capacity = 10;
    room1.equipment = '白板';
    room1.location = '一层西';

    const room2 = new MeetingRoom();
    room2.name = '金星';
    room2.capacity = 5;
    room2.equipment = '';
    room2.location = '二层东';

    const room3 = new MeetingRoom();
    room3.name = '天王星';
    room3.capacity = 30;
    room3.equipment = '白板，电视';
    room3.location = '三层东';

    this.repository.insert([room1, room2, room3]);
  }

  async find(
    pageNo: number,
    pageSize: number,
    name: string,
    capacity: number,
    equipment: string,
  ) {
    if (pageNo < 1) {
      throw new BadRequestException('页码不能小于1');
    }
    const condition: Record<string, any> = {};
    if (name) {
      condition.name = Like(`%${name}%`);
    }
    if (capacity) {
      condition.capacity = Like(`%${capacity}%`);
    }
    if (equipment) {
      condition.equipment = Like(`%${equipment}%`);
    }
    const [meetingRooms, totalCount] = await this.repository.findAndCount({
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
      where: condition,
    });

    const vo = new MeetingRoomListVo();
    vo.meetingRooms = meetingRooms;
    vo.totalCount = totalCount;
    return vo;
  }

  async create(createMeetingRoomDto: CreateMeetingRoomDto) {
    const room = await this.repository.findOneBy({
      name: createMeetingRoomDto.name,
    });
    if (room) {
      throw new BadRequestException('会议室名称已存在');
    }
    return await this.repository.save(createMeetingRoomDto);
  }

  async update(updateMeetingRoomDto: UpdateMeetingRoomDto) {
    const room = await this.repository.findOneBy({
      id: updateMeetingRoomDto.id,
    });
    if (!room) {
      throw new BadRequestException('会议室不存在');
    }

    room.capacity = updateMeetingRoomDto.capacity || room.capacity;
    room.location = updateMeetingRoomDto.location || room.location;
    room.name = updateMeetingRoomDto.name || room.name;

    if (updateMeetingRoomDto.description) {
      room.description = updateMeetingRoomDto.description;
    }
    if (updateMeetingRoomDto.equipment) {
      room.equipment = updateMeetingRoomDto.equipment;
    }

    await this.repository.update({ id: room.id }, room);
    return 'success';
  }

  async findById(id: number) {
    return await this.repository.findOneBy({ id });
  }

  /**
   * 删除指定ID的会议室，删除前会先删除该会议室相关的所有预订记录
   * @param id - 要删除的会议室的ID
   * @returns 返回操作结果 'success'
   */
  async delete(id: number) {
    // 查询该会议室相关的所有预订记录
    const bookings = await this.entityManager.findBy(Booking, {
      room: { id: id },
    });
    // 遍历预订记录，逐个删除
    for (let i = 0; i < bookings.length; i++) {
      await this.entityManager.delete(Booking, { id: bookings[i].id });
    }
    // 删除指定ID的会议室
    await this.repository.delete({ id });
    return 'success';
  }
}
