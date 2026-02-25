import { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

export const typeOrmConfig: DataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: true,
    entities: [],
    synchronize: true,
};
