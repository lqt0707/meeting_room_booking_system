import { ApiProperty } from '@nestjs/swagger';

export class MeetingRoomUsedCountVo {
  @ApiProperty({
    description: '会议室id',
  })
  meetingRoomId: number;

  @ApiProperty({
    description: '会议室名称',
  })
  meetingRoomName: string;

  @ApiProperty({
    description: '使用次数',
  })
  usedCount: number;
}
