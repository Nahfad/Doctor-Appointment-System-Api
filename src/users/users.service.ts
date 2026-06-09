import {
  Injectable, NotFoundException,
  BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Users } from './users.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { JWTPayloadType } from 'src/utils/types';
import { UserType, UserStatus, DoctorSpeciality } from 'src/utils/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cloudinary: CloudinaryService,
  ) { }

  // ─── Auth ──────────────────────────────────────────────

  public async login(dto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'name', 'email', 'password', 'userType', 'status'],
    });
    if (!user) throw new BadRequestException('Invalid email or password');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new BadRequestException('Invalid email or password');

    if (user.status === UserStatus.INACTIVE) {
      throw new ForbiddenException('Your account has been deactivated. Contact the admin.');
    }

    const token = await this.generateJWT({ id: user.id, userType: user.userType });
    return { success: true, token, user: { id: user.id, name: user.name, role: user.userType } };
  }

  // ─── User Management (Admin only) ─────────────────────

  public async createStaff(dto: CreateStaffDto, file?: Express.Multer.File) {

    // لو دكتور، التخصص إلزامي
    if (dto.userType === UserType.DOCTOR && !dto.speciality) {
      throw new BadRequestException('Speciality is required for doctors');
    }

    const exists = await this.userRepository.findOne({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already registered');

    let imageUrl: string | null = null;
    if (file) {
      const result = await this.cloudinary.uploadFile(file);
      imageUrl = result.secure_url;
    }

    const staff = this.userRepository.create({
      ...dto,
      password: await this.hashPassword(dto.password),
      status: UserStatus.ACTIVE,
      imageUrl,
    });
    await this.userRepository.save(staff);

    return {
      success: true,
      message: `${dto.userType} created successfully`,
      user: { id: staff.id, name: staff.name, email: staff.email, role: staff.userType },
    };
  }

  public async getAllUsers(
    role?: UserType,
    status?: UserStatus,
    speciality?: DoctorSpeciality,
    page: number = 1,
    limit: number = 10,
  ) {
    const where: any = {};
    if (role) where.userType = role;
    if (status) where.status = status;
    if (speciality) where.speciality = speciality;

    const [users, total] = await this.userRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: limit * (page - 1),
      take: limit,
      select: ['id', 'name', 'email', 'phone', 'userType', 'status',
        'speciality', 'experienceYears', 'fees', 'about', 'imageUrl', 'createdAt'],
    });

    return { total, page, limit, totalPages: Math.ceil(total / limit), users };
  }

  public async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'phone', 'userType', 'status',
        'speciality', 'experienceYears', 'fees', 'about', 'imageUrl', 'createdAt'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  public async updateStaff(id: number, dto: UpdateStaffDto, file?: Express.Multer.File) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (user.userType === UserType.ADMIN) {
      throw new ForbiddenException('Cannot edit admin account');
    }

    if (file) {
      const result = await this.cloudinary.uploadFile(file);
      user.imageUrl = result.secure_url;
    }

    Object.assign(user, dto);
    await this.userRepository.save(user);
    return { success: true, message: 'User updated successfully', user };
  }

  public async toggleStatus(id: number, adminId: number) {
    if (id === adminId) throw new ForbiddenException('You cannot deactivate your own account');

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (user.userType === UserType.ADMIN) {
      throw new ForbiddenException('Cannot deactivate another admin');
    }

    user.status = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    await this.userRepository.save(user);

    return {
      success: true,
      message: `User ${user.status === UserStatus.ACTIVE ? 'activated' : 'deactivated'} successfully`,
      status: user.status,
    };
  }


  public async deleteUser(id: number, adminId: number) {
    if (id === adminId) throw new ForbiddenException('You cannot delete your own account');

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.userType === UserType.ADMIN) throw new ForbiddenException('Cannot delete another admin');

    await this.userRepository.remove(user);
    return { success: true, message: 'User deleted successfully' };
  }

  // ─── Doctors ───────────────────────────────────────────

  public getSpecialities() {
    return {
      total: Object.keys(DoctorSpeciality).length,
      specialities: Object.entries(DoctorSpeciality).map(([key, value]) => ({
        key, label: value,
      })),
    };
  }

  // ─── Profile (own) ─────────────────────────────────────

  public async getMe(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'phone', 'userType', 'status',
        'speciality', 'experienceYears', 'fees', 'about', 'imageUrl', 'createdAt'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  public async updateProfile(id: number, dto: UpdateStaffDto, file?: Express.Multer.File) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (file) {
      const result = await this.cloudinary.uploadFile(file);
      user.imageUrl = result.secure_url;
    }

    Object.assign(user, dto);
    await this.userRepository.save(user);
    return { success: true, message: 'Profile updated successfully', user };
  }


  // ─── Helpers ───────────────────────────────────────────

  public async getCurrentUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private generateJWT(payload: JWTPayloadType) {
    return this.jwtService.signAsync(payload);
  }

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

}