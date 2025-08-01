import { ApiProperty } from '@nestjs/swagger';
import { BookingVo } from './booking.vo';

export class BookingListVo {
  @ApiProperty({
    description: '预订列表',
    type: [BookingVo],
  })
  bookings: BookingVo[];

  @ApiProperty({
    description: '总数量',
    type: Number,
  })
  totalCount: number;
}
