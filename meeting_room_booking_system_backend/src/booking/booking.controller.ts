import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { generateParseIntPipe } from 'src/common/utils/utils';
import { RequireLogin, UserInfo } from 'src/common/decorators/custom.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { BookingListVo } from './vo/booking-list.vo';

@ApiTags('预约模块管理')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('list')
  @ApiOperation({ summary: '获取预约列表', description: '分页获取预约列表，支持按用户名、会议室名称、位置和时间范围筛选' })
  @ApiQuery({ name: 'pageNo', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false, example: 10 })
  @ApiQuery({ name: 'username', description: '用户名（模糊搜索）', required: false, example: '张三' })
  @ApiQuery({ name: 'meetingRoomName', description: '会议室名称（模糊搜索）', required: false, example: '会议室1' })
  @ApiQuery({ name: 'meetingRoomPosition', description: '会议室位置（模糊搜索）', required: false, example: '上海' })
  @ApiQuery({ name: 'bookingTimeRangeStart', description: '预订开始时间戳', required: false, example: 1704067200000 })
  @ApiQuery({ name: 'bookingTimeRangeEnd', description: '预订结束时间戳', required: false, example: 1704153600000 })
  @ApiResponse({ status: 200, description: '获取成功', type: BookingListVo })
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query('username') username: string,
    @Query('meetingRoomName') meetingRoomName: string,
    @Query('meetingRoomPosition') meetingRoomPosition: string,
    @Query('bookingTimeRangeStart') bookingTimeRangeStart?: number,
    @Query('bookingTimeRangeEnd') bookingTimeRangeEnd?: number,
  ) {
    return this.bookingService.list(
      pageNo,
      pageSize,
      username,
      meetingRoomName,
      meetingRoomPosition,
      bookingTimeRangeStart,
      bookingTimeRangeEnd,
    );
  }

  @Post('add')
  @RequireLogin()
  @ApiOperation({ summary: '创建预约', description: '用户创建新的会议室预约' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateBookingDto, description: '预约信息' })
  @ApiResponse({ status: 200, description: '预约成功' })
  @ApiResponse({ status: 400, description: '会议室不存在/用户不存在/时间段冲突' })
  async add(
    @Body() createBookingDto: CreateBookingDto,
    @UserInfo('userId') userId: number,
  ) {
    return this.bookingService.add(createBookingDto, userId);
  }

  @Get('apply/:id')
  @ApiOperation({ summary: '审批通过预约', description: '管理员审批通过预约申请' })
  @ApiParam({ name: 'id', description: '预约ID', example: 1 })
  @ApiResponse({ status: 200, description: '审批成功', example: 'success' })
  @ApiResponse({ status: 400, description: '预约不存在' })
  async apply(@Param('id') id: number) {
    return this.bookingService.apply(id);
  }

  @Get('reject/:id')
  @ApiOperation({ summary: '驳回预约', description: '管理员驳回预约申请' })
  @ApiParam({ name: 'id', description: '预约ID', example: 1 })
  @ApiResponse({ status: 200, description: '驳回成功', example: 'success' })
  @ApiResponse({ status: 400, description: '预约不存在' })
  async reject(@Param('id') id: number) {
    return this.bookingService.reject(id);
  }

  @Get('unbind/:id')
  @ApiOperation({ summary: '解除预约', description: '用户解除已预约的会议室' })
  @ApiParam({ name: 'id', description: '预约ID', example: 1 })
  @ApiResponse({ status: 200, description: '解除成功', example: 'success' })
  @ApiResponse({ status: 400, description: '预约不存在' })
  async unbind(@Param('id') id: number) {
    return this.bookingService.unbind(id);
  }

  @Get('urge/:id')
  @ApiOperation({ summary: '催办预约', description: '用户催办待审批的预约，半小时内只能催办一次' })
  @ApiParam({ name: 'id', description: '预约ID', example: 1 })
  @ApiResponse({ status: 200, description: '催办成功', example: '催办成功' })
  @ApiResponse({ status: 200, description: '频繁催办', example: '半小时只能催办一次，请耐心等待' })
  @ApiResponse({ status: 400, description: '预约不存在/管理员不存在' })
  async urge(@Param('id') id: number) {
    return this.bookingService.urge(id);
  }
}
