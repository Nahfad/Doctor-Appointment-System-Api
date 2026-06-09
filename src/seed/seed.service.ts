import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Users } from '../users/users.entity';
import { UserType } from '../utils/enums';
import { UserStatus } from '../utils/enums';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        @InjectRepository(Users)
        private readonly userRepository: Repository<Users>,
    ) { }

    async onModuleInit() {
        await this.seedAdmin();
    }

    private async seedAdmin() {
        const adminExists = await this.userRepository.findOne({
            where: {
                userType: UserType.ADMIN,
            },
        });

        if (adminExists) {
            console.log('Admin already exists');
            return;
        }

        const hashedPassword = await bcrypt.hash(
            'Admin@123',
            10,
        );

        await this.userRepository.save({
            name: 'System Admin',
            email: 'admin@clinic.com',
            phone: '01145719730',
            password: hashedPassword,
            userType: UserType.ADMIN,
            status: UserStatus.ACTIVE,
        });

        console.log('Default admin created successfully');
    }
}