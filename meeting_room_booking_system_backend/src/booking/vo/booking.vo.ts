import { ApiProperty } from '@nestjs/swagger';

export class BookingVo {
  @ApiProperty({
    description: '预订id',
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: '开始时间',
    type: Date,
  })
  startTime: Date;

  @ApiProperty({
    description: '结束时间',
    type: Date,
  })
  endTime: Date;

  @ApiProperty({
    description: '状态',
    type: String,
  })
  status: string;

  @ApiProperty({
    description: '会议室信息',
    type: Object,
  })
  room: {
    id: number;
    name: string;
    capacity: number;
    location: string;
    equipment: string;
    description: string;
  };

  @ApiProperty({
    description: '用户信息',
    type: Object,
  })
  user: {
    id: number;
    username: string;
    nickName: string;
    email: string;
    headPic: string;
  };
}
