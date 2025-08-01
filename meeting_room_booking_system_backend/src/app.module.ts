import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { LoginGuard } from './common/guards/login.guard';
import { PermissionGuard } from './common/guards/permission.guard';
import { MeetingRoomModule } from './meeting-room/meeting-room.module';
import { BookingModule } from './booking/booking.module';
import { StatisticModule } from './statistic/statistic.module';
import * as path from 'path';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt_secret'),
          signOptions: {
            expiresIn: configService.get('jwt_access_token_expires_time'),
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '.env'),
    }),
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService) {
        return {
          type: 'mysql',
          host: configService.get('mysql_host'),
          port: configService.get('mysql_port'),
          username: configService.get('mysql_user'),
          password: configService.get('mysql_password'),
          database: configService.get('mysql_database'),
          logging: configService.get('mysql_logging') === 'true',
          poolSize: configService.get('mysql_pool_size') || 10,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('mysql_synchronize') === 'true',
          connectorPackage: 'mysql2',
          extra: {
            authPlugin: 'sha256_password',
            connectTimeout: configService.get('mysql_connect_timeout') || 60000,
            acquireTimeout: configService.get('mysql_acquire_timeout') || 60000,
            timeout: 60000,
            reconnect: true,
            idleTimeout: configService.get('mysql_idle_timeout') || 300000,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
          },
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    RedisModule,
    EmailModule,
    MeetingRoomModule,
    BookingModule,
    StatisticModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: LoginGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
})
export class AppModule {}
