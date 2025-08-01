import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateMeetingRoomDto {
  @ApiProperty({
    description: '会议室名称',
    type: String,
  })
  @IsNotEmpty({ message: '会议室名称不能为空' })
  @MaxLength(10, { message: '会议室名称不能超过10个字符' })
  name: string;

  @ApiProperty({
    description: '会议室容量',
    type: Number,
  })
  @IsNotEmpty({ message: '会议室容量不能为空' })
  capacity: number;

  @ApiProperty({
    description: '会议室位置',
    type: String,
  })
  @IsNotEmpty({ message: '会议室位置不能为空' })
  @MaxLength(50, { message: '会议室位置不能超过50个字符' })
  location: string;

  @ApiProperty({
    description: '会议室设备',
    type: String,
  })
  @IsNotEmpty({ message: '会议室设备不能为空' })
  @MaxLength(50, { message: '会议室设备不能超过50个字符' })
  equipment: string;

  @ApiProperty({
    description: '会议室描述',
    type: String,
  })
  @IsNotEmpty({ message: '会议室描述不能为空' })
  @MaxLength(100, { message: '会议室描述不能超过100个字符' })
  description: string;
}
