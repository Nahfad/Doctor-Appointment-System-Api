import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Doctor } from './doctors/doctors.entity';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DoctorsModule } from './doctors/doctors.module';
import { UserModule } from './users/users.module';
import { Users } from './users/users.entity';
import { AppointmentModule } from './appointment/appointment.module';
import { Appointment } from './appointment/appointment.entity';



@Module({
  imports: [
    DoctorsModule,
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
          entities: [Doctor, Users, Appointment]
        }
      }
    }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env.${process.env.NODE_ENV}` }),
    CloudinaryModule,
    UserModule,
    AppointmentModule,

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
