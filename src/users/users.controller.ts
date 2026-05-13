import { Controller, Post, Get, Body, Request, UseGuards, HttpCode, HttpStatus, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CurrentUser } from '../Auth/guards/decorators/current-user.decorator';
import { AuthGuard } from '../Auth/guards/auth.guard';
import { AuthRolesGuard } from 'src/Auth/guards/auth.roles.guard';
import { Roles } from 'src/Auth/guards/decorators/user-role.decorator';
import { UpdateUserDto } from './dto/update-User.dto';
import { UserType } from 'src/utils/enums';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('api/user')
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  // POST /api/user/register (Public)
  @Post('register')
  @UseInterceptors(FileInterceptor('file'))
  public register(
    @UploadedFile() file: Express.Multer.File,
    @Body() registerUserDto: RegisterUserDto
  ) {
    return this.userService.register(registerUserDto, file);
  }

  // POST /api/user/login (Public)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  // GET /api/user/current-user (Protected - User only)
  @Get('current-user')
  @UseGuards(AuthGuard)
  public getCurrentUser(@CurrentUser() payload) {
    return this.userService.getCurrentUser(payload.id);
  }

  // PUT /api/User/update-profile (Protected)
  @Put('update-profile')
  @Roles(UserType.User, UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public updateProfile(@CurrentUser() payload, @Body() body: UpdateUserDto) {
    return this.userService.updateProfile(payload.id, body);
  }

}