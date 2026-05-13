import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Users } from './users.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JWTPayloadType } from 'src/utils/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cloudinary: CloudinaryService

  ) { }

  /**
   * register a new user in system
   * @param dto data for the user
   * @returns token for the user
   */
  public async register(dto: RegisterUserDto, file: Express.Multer.File) {
    // 1. confirm if email exist 
    const exists = await this.userRepository.findOne({ where: { email: dto.email } });
    if (exists) throw new NotFoundException('Email already registered');

    // 2. Upload Image
    let imageUrl: string;
    try {
      const uploadResult = await this.cloudinary.uploadFile(file);
      imageUrl = uploadResult.secure_url;
    } catch (error) {
      throw new BadRequestException('faild to upload image');
    }
    // 3. Hashing Password
    const hashedPassword = await this.hashPassword(dto.password);

    // 4. save in db

    const user = this.userRepository.create({ ...dto, password: hashedPassword, imageUrl: imageUrl });
    await this.userRepository.save(user);

    // create JWT
    const token = await this.generateJWT({ id: user.id, userType: user.userType });

    return { success: true, message: 'User created', token };
  }

  /**
  * Log In user
  * @param loginDto data for Log in to user account
  * @returns JWT
 */
  public async login(dto: LoginUserDto) {
    const { email, password } = dto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid Email or Password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid Email or Password');
    }

    // create JWT
    const token = await this.generateJWT({ id: user.id, userType: user.userType });

    return { success: true, token };
  }

  /**
   * Update user
   * @param id id of the logged the user
   * @param dto data for updating the user
   * @returns updated user from the database  
   */
  public async updateProfile(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.name = dto.name ?? user.name
    user.phone = dto.phone ?? user.phone
    user.imageUrl = dto.image ?? user.imageUrl


    await this.getCurrentUser(id)
    return {
      success: true,
      message: 'Profile updated successfully',
      user,
    };
  }

  /**
   * Get current User (logged in user)
   * @param id id of the logged user
   * return the user form the database
  */
  public async getCurrentUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) throw new NotFoundException("user not found")
    return user;
  }

  /**
   * Generate Json Web Token
   * @param Payload JWT Payload
   * @returns Token 
   */
  private generateJWT(payload: JWTPayloadType) {
    return this.jwtService.signAsync(payload)
  }

  /**
   * Hashing password
   * @param password plain text password
   * @returns hashed password
   */
  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
  }

}


