import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ClientsModule.register([
  {
    name: 'AUTH_SERVICE',
    transport: Transport.TCP,
    options: {
      host: process.env.AUTH_HOST || 'localhost', // Matches docker-compose service name
      port: 8001,
    },
  }
]),
  ],
  controllers: [AuthController], // Controller belongs HERE
  exports: [ClientsModule],      // Export it so others can use it if needed
})
export class AuthModule {}