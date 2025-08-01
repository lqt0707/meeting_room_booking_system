import { ApiProperty } from '@nestjs/swagger';

export class UserBookingCountVo {
  @ApiProperty({
    description: '用户id',
  })
  userId: number;

  @ApiProperty({
    description: '用户名',
  })
  username: string;

  @ApiProperty({
    description: '用户预约总数',
  })
  bookingCount: number;
}
