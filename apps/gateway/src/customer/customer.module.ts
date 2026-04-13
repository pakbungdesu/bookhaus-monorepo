import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CustomerController } from './customer.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CUSTOMER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.CUSTOMER_HOST || 'localhost',
          port: 8004,
        },
      },
      {
        name: 'ORDER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ORDER_HOST || 'localhost',
          port: 8003,
        },
      },
    ]),
  ],
  controllers: [CustomerController],
})
export class CustomerModule {}