import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  DefaultValuePipe,
  HttpStatus,
} from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { generateParseIntPipe } from 'src/common/utils/utils';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequireLogin } from 'src/common/decorators/custom.decorator';
import { MeetingRoomVo } from './vo/meeting-room.vo';
import { MeetingRoomListVo } from './vo/meeting-room-list.vo';

@ApiTags('会议室管理模块')
@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @ApiBearerAuth()
  @ApiQuery({
    name: 'pageNo',
    description: '页码',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页条数',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'name',
    description: '会议室名称',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'capacity',
    description: '会议室容量',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'equipment',
    description: '会议室设备',
    type: String,
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '查询成功',
    type: MeetingRoomListVo,
  })
  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query('name') name: string,
    @Query('capacity') capacity: number,
    @Query('equipment') equipment: string,
  ) {
    return this.meetingRoomService.find(
      pageNo,
      pageSize,
      name,
      capacity,
      equipment,
    );
  }

  @ApiBearerAuth()
  @ApiBody({
    type: CreateMeetingRoomDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '会议室名称已存在',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '创建成功',
    type: MeetingRoomVo,
  })
  @Post('create')
  async create(@Body() createMeetingRoomDto: CreateMeetingRoomDto) {
    return await this.meetingRoomService.create(createMeetingRoomDto);
  }

  @ApiBearerAuth()
  @ApiBody({
    type: UpdateMeetingRoomDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '会议室不存在',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '创建成功',
  })
  @Put('update')
  async update(@Body() updateMeetingRoomDto: UpdateMeetingRoomDto) {
    return await this.meetingRoomService.update(updateMeetingRoomDto);
  }

  @ApiBearerAuth()
  @ApiResponse({
    description: 'success',
    status: HttpStatus.OK,
    type: MeetingRoomVo,
  })
  @Get(':id')
  async get(@Param('id') id: number) {
    return await this.meetingRoomService.findById(id);
  }

  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: '会议室id',
    type: Number,
  })
  @ApiResponse({
    description: 'success',
    status: HttpStatus.OK,
  })
  @RequireLogin()
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.meetingRoomService.delete(id);
  }
}
