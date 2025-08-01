import { ApiProperty } from '@nestjs/swagger';
import { MeetingRoomVo } from './meeting-room.vo';

export class MeetingRoomListVo {
  @ApiProperty({
    description: '会议室列表',
    type: [MeetingRoomVo],
  })
  meetingRooms: MeetingRoomVo[];

  @ApiProperty({
    description: '总条数',
    type: Number,
  })
  totalCount: number;
}
