import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { Doctor } from '../src/doctors/doctors.entity';

// dot env config
config({ path: '.env' })

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [Doctor],
    migrations: ["dist/db/migrations/*.js"]
}

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;