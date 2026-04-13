import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order, OrderDetail, Book, Customer, Person } from '@app/shared'; 

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'mysql-db',
      port: 3306,
      username: 'root',
      password: 'admin',
      database: 'bookhaus_db',
      entities: [Order, OrderDetail, Book, Customer, Person],
      synchronize: false,
    }),
    
    TypeOrmModule.forFeature([Order, OrderDetail, Book, Customer, Person]),

    ClientsModule.register([
      {
        name: 'INVENTORY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.INVENTORY_HOST || 'inventory-service',
          port: 8002,
        },
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}