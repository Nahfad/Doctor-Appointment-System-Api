import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Patient } from './patient.entity';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { LoginPatientDto } from './dto/login-patient.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private generateToken(id: string): string {
    // Payload: just id
    return this.jwtService.sign(
      { id },
      { secret: this.configService.get<string>('JWT_SECRET') },
    );
  }

  async register(
    registerPatientDto: RegisterPatientDto,
  ) {
    const { name, email, password } = registerPatientDto;

    const existing = await this.patientRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const patient = this.patientRepository.create({
        name,
        email,
        password: hashedPassword,
      });

      await this.patientRepository.save(patient);

      const token = this.generateToken(patient.id);

      return { success: true, token };
    } catch (error) {
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(
    loginPatientDto: LoginPatientDto,
  ) {
    const { email, password } = loginPatientDto;

    const patient = await this.patientRepository.findOne({ where: { email } });
    if (!patient) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(patient.id);

    return { success: true, token };
  }
}

  
