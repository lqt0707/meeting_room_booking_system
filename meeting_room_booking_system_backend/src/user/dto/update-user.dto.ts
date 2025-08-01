import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: '用户名不能为空' })
  @ApiProperty()
  captcha: string;

  @ApiProperty()
  headPic: string;

  @ApiProperty()
  nickName: string;
}
