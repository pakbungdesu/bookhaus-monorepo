import { Module } from '@nestjs/common';
import { EmployeeController } from './employee-service.controller';
import { EmployeeService } from './employee-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee, Person} from '@app/shared'; 

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'mysql-db', 
      port: 3306,
      username: 'root',
      password: 'admin',
      database: 'bookhaus_db',
      entities: [Employee, Person], 
      synchronize: false,
      logging: true,
    }),
    TypeOrmModule.forFeature([Employee, Person]),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}
