import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Inject,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RequireLogin, UserInfo } from 'src/common/decorators/custom.decorator';
import { UserDetailVo } from './vo/user-info.vo';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generateParseIntPipe } from 'src/common/utils/utils';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginUserVo } from './vo/login-user.vo';
import { RefreshTokenVo } from './vo/refresh-token.vo';
import { UserListVo } from './vo/user-list.vo';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { storage } from 'src/common/utils/my-file-storage';

@ApiTags('用户管理模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(EmailService)
  private readonly emailService: EmailService;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/验证码错误/用户名已存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功/失败',
    type: String,
  })
  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  @ApiQuery({
    name: 'address',
    description: '邮箱地址',
    example: '123@qq.com',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  @Get('register-captcha')
  async getRegisterCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`captcha_${address}`, code, 60 * 5);
    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `<p>您的注册验证码为：${code}</p>`,
    });
    return '验证码已发送';
  }

  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return '初始化数据成功';
  }

  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '用户名不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和token',
    type: LoginUserVo,
  })
  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    const vo: LoginUserVo = await this.userService.login(loginUser, false);
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        email: vo.userInfo.email,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
        iat: Date.now(),
        jti: Math.random().toString(36).substring(2, 15),
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );
    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        iat: Date.now(),
        jti: Math.random().toString(36).substring(2, 15),
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expires_time') || '7d',
      },
    );
    return vo;
  }

  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '用户名不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和token',
    type: LoginUserVo,
  })
  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, true);
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        email: vo.userInfo.email,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
        iat: Date.now(),
        jti: Math.random().toString(36).substring(2, 15),
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );
    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        iat: Date.now(),
        jti: Math.random().toString(36).substring(2, 15),
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expires_time') || '7d',
      },
    );
    return vo;
  }

  @ApiQuery({
    name: 'refreshToken',
    description: '刷新token',
    example: 'xxxxxx',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshTokenVo,
  })
  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, false);

      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,
          permissions: user.permissions,
          iat: Date.now(),
          jti: Math.random().toString(36).substring(2, 15),
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );

      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
          iat: Date.now(),
          jti: Math.random().toString(36).substring(2, 15),
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expires_time') || '7d',
        },
      );

      const vo = new RefreshTokenVo();
      vo.access_token = access_token;
      vo.refresh_token = refresh_token;

      return vo;
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @ApiQuery({
    name: 'adminRefreshToken',
    description: '刷新管理员token',
    example: 'xxxxxx',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshTokenVo,
  })
  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, true);

      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions,
          iat: Date.now(),
          jti: Math.random().toString(36).substring(2, 15),
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );

      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
          iat: Date.now(),
          jti: Math.random().toString(36).substring(2, 15),
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expires_time') || '7d',
        },
      );

      const vo = new RefreshTokenVo();
      vo.access_token = access_token;
      vo.refresh_token = refresh_token;

      return vo;
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息',
    type: UserDetailVo,
  })
  @Get('info')
  @RequireLogin()
  async getUserInfo(@UserInfo('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    const vo = new UserDetailVo();
    vo.id = user.id;
    vo.username = user.username;
    vo.nickName = user.nickName || '';
    vo.email = user.email;
    vo.headPic = user.headPic || '';
    vo.phoneNumber = user.phoneNumber || '';
    vo.isFrozen = user.isFrozen || false;
    vo.createTime = user.createTime;
    return vo;
  }

  @ApiBody({
    type: UpdateUserPasswordDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/不正确/用户名不存在',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '密码更新成功/失败',
  })
  @Post(['update_password', 'admin/update_password'])
  async updatePassword(@Body() updatePasswordDto: UpdateUserPasswordDto) {
    return await this.userService.updatePassword(updatePasswordDto);
  }

  @ApiQuery({
    name: 'address',
    description: '用户邮箱',
    example: 'xxxxxx@qq.com',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '验证码发送成功',
  })
  @Get('update_password/captcha')
  async getUpdatePasswordCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().substring(2, 8);
    await this.redisService.set(
      `update_password_captcha_${address}`,
      code,
      60 * 5,
    );
    await this.emailService.sendMail({
      to: address,
      subject: '密码重置验证码',
      html: `<p>您的密码重置验证码为：${code}</p>`,
    });
    return '验证码发送成功';
  }

  @ApiBearerAuth()
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/不正确',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息更新成功',
  })
  @Post(['update', 'admin/update'])
  @RequireLogin()
  async update(
    @UserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(userId, updateUserDto);
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: '验证码发送成功',
  })
  @Get('update/captcha')
  async updateCaptcha(@UserInfo('email') address: string) {
    const code = Math.random().toString().substring(2, 8);
    await this.redisService.set(`update_captcha_${address}`, code, 60 * 10);
    await this.emailService.sendMail({
      to: address,
      subject: '用户信息更新验证码',
      html: `<p>您的用户信息更新验证码为：${code}</p>`,
    });
    return '验证码发送成功';
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    description: '用户 id',
    example: 1,
    type: Number,
    required: true,
  })
  @ApiResponse({
    type: String,
    description: 'success',
  })
  @Get('freeze')
  async freeze(@Query('id') userId: number) {
    await this.userService.freezeUserById(userId);
    return 'success';
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'pageNo',
    description: '页码',
    example: 1,
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页数量',
    example: 10,
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'username',
    description: '用户名',
    example: 'xxxxxx',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'nickName',
    description: '昵称',
    example: 'xxxxxx',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'email',
    description: '邮箱',
    example: 'xxxxxx@qq.com',
    type: String,
    required: false,
  })
  @ApiResponse({
    type: UserListVo,
    description: '用户列表',
  })
  @RequireLogin()
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
    @Query('username') username: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string,
  ) {
    return await this.userService.findUsersByPage(
      pageNo,
      pageSize,
      username,
      nickName,
      email,
    );
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
      storage: storage,
      limits: {
        fileSize: 3 * 1024 * 1024,
      },
      fileFilter(req, file, callback) {
        const extname = path.extname(file.originalname);
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(extname)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('只能上传图片'), false);
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return file.path;
  }
}
