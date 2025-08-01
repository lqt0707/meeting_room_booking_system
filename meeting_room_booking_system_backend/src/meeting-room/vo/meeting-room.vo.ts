import { ApiProperty } from '@nestjs/swagger';

export class MeetingRoomVo {
  @ApiProperty({
    description: '会议室id',
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: '会议室名称',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: '会议室容量',
    type: Number,
  })
  capacity: number;

  @ApiProperty({
    description: '会议室位置',
    type: String,
  })
  location: string;

  @ApiProperty({
    description: '会议室设备',
    type: String,
  })
  equipment: string;

  @ApiProperty({
    description: '会议室描述',
    type: String,
  })
  description: string;

  @ApiProperty({
    description: '是否已被预订',
    type: Boolean,
  })
  isBooked: boolean;

  @ApiProperty({
    description: '创建时间',
    type: Date,
  })
  createTime: Date;

  @ApiProperty({
    description: '更新时间',
    type: Date,
  })
  updateTime: Date;
}
