import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Patient } from '../../patient/patient.entity';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true; // public route
        }

        const request = context.switchToHttp().getRequest<Request>();

        // Get token from 'token' header (واحد فقط)
        const token = request.headers['token'] as string;

        if (!token) {
            throw new UnauthorizedException('Not Authorized Login Again');
        }

        try {
            const decoded = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            // Check if it's admin token (has 'data' field)
            if (decoded.data && requiredRoles.includes(Role.ADMIN)) {
                const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
                const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

                if (decoded.data === adminEmail + adminPassword) {
                    request['user'] = { role: Role.ADMIN };
                    return true;
                }
            }

            // Check if it's patient token (has 'id' field)
            if (decoded.id && requiredRoles.includes(Role.PATIENT)) {
                const patient = await this.patientRepository.findOne({
                    where: { id: decoded.id },
                });

                if (patient) {
                    request['user'] = { id: patient.id, role: Role.PATIENT };
                    return true;
                }
            }

            throw new UnauthorizedException('Not Authorized Login Again');
        } catch {
            throw new UnauthorizedException('Not Authorized Login Again');
        }
    }
}