import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UserModule } from './users/users.module';
import { AppointmentModule } from './appointment/appointment.module';
import { PatientModule } from './patient/patient.module';
import { SeedModule } from './seed/seed.module';


@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          database: config.get<string>("DB_DATABASE"),
          username: config.get<string>("DB_USERNAME"),
          password: config.get<string>("DB_PASSWORD"),
          port: config.get<number>("DB_PORT"),
          host: 'localhost',
          synchronize: process.env.NODE_ENV !== 'prodcution',
          autoLoadEntities: true,
        }
      }
    }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env.${process.env.NODE_ENV}` }),
    CloudinaryModule,
    UserModule,
    AppointmentModule,
    PatientModule,
    SeedModule,

  ],
})
export class AppModule { }



/*   LOCAL DATABASE */
// {
//       inject: [ConfigService],
//       useFactory: (config: ConfigService) => {
//         return {
//           type: 'postgres',
//           database: config.get<string>("DB_DATABASE"),
//           username: config.get<string>("DB_USERNAME"),
//           password: config.get<string>("DB_PASSWORD"),
//           port: config.get<number>("DB_PORT"),
//           host: 'localhost',
//           synchronize: process.env.NODE_ENV !== 'prodcution',
//           entities: []
//         }
//       }
// }