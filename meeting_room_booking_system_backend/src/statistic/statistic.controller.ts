import { Controller, Get, HttpStatus, Inject, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserBookingCountVo } from './vo/user-booking-count.vo';
import { MeetingRoomUsedCountVo } from './vo/meeting-room-used-count.vo';

@ApiTags('统计模块管理')
@Controller('statistic')
export class StatisticController {
  @Inject(StatisticService)
  private statisticService: StatisticService;

  @ApiBearerAuth()
  @ApiQuery({
    name: 'startTime',
    description: '开始时间',
    type: String,
  })
  @ApiQuery({
    name: 'endTime',
    description: '结束时间',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [UserBookingCountVo],
  })
  @Get('userBookingCount')
  async userBookingCount(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.statisticService.userBookingCount(startTime, endTime);
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'startTime',
    description: '开始时间',
    type: String,
  })
  @ApiQuery({
    name: 'endTime',
    description: '结束时间',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [MeetingRoomUsedCountVo],
  })
  @Get('meetingRoomUsedCount')
  async meetingRoomUsedCount(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.statisticService.meetingRoomUsedCount(startTime, endTime);
  }
}
