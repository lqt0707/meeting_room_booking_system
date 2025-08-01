import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMeetingRoomDto } from './create-meeting-room.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateMeetingRoomDto extends PartialType(CreateMeetingRoomDto) {
  @ApiProperty({
    description: '会议室ID',
  })
  @IsNotEmpty({ message: '会议室ID不能为空' })
  id: number;
}
