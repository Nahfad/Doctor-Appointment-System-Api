import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // POST /api/admin/login
  @Post('login')
  async login(@Body() adminLoginDto: AdminLoginDto) {
    return this.adminService.login(adminLoginDto);
  }
}