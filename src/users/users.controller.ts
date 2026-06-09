import {
  Controller, Post, Get, Put, Patch, Delete,
  Body, Param, Query, ParseIntPipe,
  DefaultValuePipe, UseGuards, UseInterceptors,
  UploadedFile, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { Roles } from 'src/Auth/guards/decorators/user-role.decorator';
import { CurrentUser } from 'src/Auth/guards/decorators/current-user.decorator';
import { AuthRolesGuard } from 'src/Auth/guards/auth.roles.guard';
import { UserType, UserStatus, DoctorSpeciality } from 'src/utils/enums';
import { JWTPayloadType } from 'src/utils/types';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // ─── Auth ─────────────────────────────────────────────

  // POST /api/users/login  (Public)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public login(@Body() dto: LoginUserDto) {
    return this.usersService.login(dto);
  }

  // ─── Profile (own) ────────────────────────────────────

  // GET /api/users/me  (All roles)
  @Get('me')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.RECEPTIONIST)
  @UseGuards(AuthRolesGuard)
  public getMe(@CurrentUser() payload: JWTPayloadType) {
    return this.usersService.getMe(payload.id);
  }

  // PUT /api/users/me  (All roles)
  @Put('me')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.RECEPTIONIST)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  public updateProfile(
    @CurrentUser() payload: JWTPayloadType,
    @Body() dto: UpdateStaffDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.updateProfile(payload.id, dto, file);
  }


  // ─── Doctors ──────────────────────────────────────────

  // GET /api/users/specialities  (Public)
  @Get('specialities')
  public getSpecialities() {
    return this.usersService.getSpecialities();
  }

  // ─── User Management (Admin only) ─────────────────────

  // POST /api/users  (Admin only)
  @Post()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  public createStaff(
    @Body() dto: CreateStaffDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.createStaff(dto, file);
  }

  // GET /api/users?role=doctor&status=active&speciality=Cardiology&page=1&limit=10
  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public getAllUsers(
    @Query('role') role?: UserType,
    @Query('status') status?: UserStatus,
    @Query('speciality') speciality?: DoctorSpeciality,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.usersService.getAllUsers(role, status, speciality, page, limit);
  }

  // GET /api/users/:id  (Admin only)
  @Get(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  // PUT /api/users/:id  (Admin only)
  @Put(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  public updateStaff(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.updateStaff(id, dto, file);
  }

  // PATCH /api/users/:id/toggle-status  (Admin only)
  @Patch(':id/toggle-status')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.usersService.toggleStatus(id, payload.id);
  }


  // DELETE /api/users/:id  (Admin only)
  @Delete(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.usersService.deleteUser(id, payload.id);
  }
}