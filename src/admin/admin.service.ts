import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) { }

  async login(adminLoginDto: AdminLoginDto) {
    const { email, password } = adminLoginDto;

    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (email !== adminEmail || password !== adminPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Payload: email+password concatenated
    const token = this.jwtService.sign(
      { data: email + password },
      { secret: this.configService.get<string>('JWT_SECRET') },
    );

    return { success: true, token };
  }
}