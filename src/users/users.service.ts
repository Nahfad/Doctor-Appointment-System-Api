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
import { UserType, UserStatus } from 'src/utils/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cloudinary: CloudinaryService,
  ) { }

  // ─────────────────────────────────────────────
  //  Auth
  // ─────────────────────────────────────────────


  /**
   * Login for all roles — checks status before issuing token
   * @param dto data for the user
   * @returns JWT 
   */
  public async login(dto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'name', 'email', 'password', 'userType', 'status'],
    });

    if (!user) throw new BadRequestException('Invalid email or password');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new BadRequestException('Invalid email or password');

    // Check that the account is active
    if (user.status === UserStatus.INACTIVE) {
      throw new ForbiddenException('Your account has been deactivated. Contact the admin.');
    }

    const token = await this.generateJWT({ id: user.id, userType: user.userType });
    return {
      success: true,
      token,
      user: { id: user.id, name: user.name, role: user.userType },
    };
  }

  // ─────────────────────────────────────────────
  //  User Management (Admin only)
  // ─────────────────────────────────────────────

  /**
   * Create Doctor or Receptionist account (Admin only)
   */
  public async createStaff(dto: CreateStaffDto) {

    const exists = await this.userRepository.findOne({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already registered');

    const hashedPassword = await this.hashPassword(dto.password);
    const staff = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });
    await this.userRepository.save(staff);

    return {
      success: true,
      message: `${dto.userType} account created successfully`,
      user: { id: staff.id, name: staff.name, email: staff.email, role: staff.userType },
    };
  }

  /**
   * Get all users with filters (Admin only)
   */
  public async getAllUsers(
    role?: UserType,
    status?: UserStatus,
    page: number = 1,
    limit: number = 10,
  ) {
    const where: any = {};
    if (role) where.userType = role;
    if (status) where.status = status;

    const [users, total] = await this.userRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: limit * (page - 1),
      take: limit,
      select: ['id', 'name', 'email', 'phone', 'userType', 'status', 'specialization', 'imageUrl', 'createdAt'],
    });

    return { total, page, limit, totalPages: Math.ceil(total / limit), users };
  }

  /**
   * Get single user by id (Admin only)
   */
  public async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'phone', 'userType', 'status', 'specialization', 'imageUrl', 'createdAt'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Update user data by Admin
   */
  public async updateStaff(id: number, dto: UpdateStaffDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (user.userType === UserType.ADMIN) {
      throw new ForbiddenException('Cannot edit admin account');
    }

    Object.assign(user, dto);
    await this.userRepository.save(user);

    return { success: true, message: 'User updated successfully', user };
  }

  /**
   * Toggle user status Active ↔ Inactive (Admin only)
   * Deactivated users cannot login
   */
  public async toggleStatus(id: number, adminId: number) {
    if (id === adminId) {
      throw new ForbiddenException('You cannot deactivate your own account');
    }

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

  /**
   * Delete user (Admin only) — preserves visits and prescriptions
   */
  public async deleteUser(id: number, adminId: number) {
    if (id === adminId) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (user.userType === UserType.ADMIN) {
      throw new ForbiddenException('Cannot delete another admin');
    }

    await this.userRepository.remove(user);
    return { success: true, message: 'User deleted successfully' };
  }

  // ─────────────────────────────────────────────
  //  Profile (own)
  // ─────────────────────────────────────────────

  /**
   * Get current logged-in user profile
   */
  public async getMe(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'phone', 'userType', 'status', 'specialization', 'imageUrl', 'createdAt'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Update own profile (name, phone, specialization, photo)
   */
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



  // ─────────────────────────────────────────────
  //  Helpers
  // ─────────────────────────────────────────────

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