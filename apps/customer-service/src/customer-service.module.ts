import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer-service.controller';
import { CustomerService } from './customer-service.service';
import { Customer, Person} from '@app/shared'; 

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'mysql-db', 
      port: 3306,
      username: 'root',
      password: 'admin',
      database: 'bookhaus_db',
      entities: [Customer, Person], 
      synchronize: false,
      logging: true,
    }),
    TypeOrmModule.forFeature([Customer, Person]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}