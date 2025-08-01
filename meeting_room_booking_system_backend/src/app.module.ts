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
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME'),
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '.env'),
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService) {
        return {
          type: 'mysql',
          host: configService.get('MYSQL_HOST'),
          port: configService.get('MYSQL_PORT'),
          username: configService.get('MYSQL_USER'),
          password: configService.get('MYSQL_PASSWORD'),
          database: configService.get('MYSQL_DATABASE'),
          logging: configService.get('MYSQL_LOGGING') === 'true',
          poolSize: configService.get('MYSQL_POOL_SIZE') || 10,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('MYSQL_SYNCHRONIZE') === 'true' && process.env.NODE_ENV !== 'production',
          connectorPackage: 'mysql2',
          extra: {
            authPlugin: 'sha256_password',
            connectTimeout: configService.get('MYSQL_CONNECT_TIMEOUT') || 60000,
            acquireTimeout: configService.get('MYSQL_ACQUIRE_TIMEOUT') || 60000,
            timeout: 60000,
            reconnect: true,
            idleTimeout: configService.get('MYSQL_IDLE_TIMEOUT') || 300000,
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
