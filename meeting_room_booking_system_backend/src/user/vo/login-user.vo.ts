import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

class UserInfo {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: 'zhangsan' })
  username: string;

  @ApiProperty({ example: '张三' })
  nickName: string;

  @ApiProperty({ example: 'zhangsan@example.com' })
  email: string;

  @ApiProperty({ example: 'https://example.com/headPic.jpg' })
  headPic: string;

  @ApiProperty({ example: '13800000000' })
  phoneNumber: string;

  @ApiProperty({ example: false })
  isFrozen: boolean;

  @ApiProperty({ example: false })
  isAdmin: boolean;

  @ApiProperty({ example: 1623456789000 })
  createTime: number;

  @ApiProperty({ example: ['管理员'] })
  roles: string[];

  @ApiProperty({
    example: [{ id: 1, description: '权限1', code: 'user:list' }],
  })
  permissions: Permission[];
}

export class LoginUserVo {
  @ApiProperty({ type: UserInfo })
  userInfo: UserInfo;

  @ApiProperty({ example: 'accessToken' })
  accessToken: string;

  @ApiProperty({ example: 'refreshToken' })
  refreshToken: string;
}
