import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Users } from './users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthRolesGuard } from '../Auth/guards/auth.roles.guard';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users],),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') as any,
        },
      }),
    }),
    ConfigModule, CloudinaryModule
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthRolesGuard],
  exports: [UsersService, TypeOrmModule],
})
export class UserModule { }