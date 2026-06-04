// seed.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedService } from './seed.service';
import { Users } from '../users/users.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Users]),
    ],
    providers: [SeedService],
})
export class SeedModule { }