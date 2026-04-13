import { Module } from '@nestjs/common';
import { InfoController } from './info.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
  {
    name: 'INFO_SERVICE',
    transport: Transport.TCP,
    options: {
      host: process.env.INFO_HOST || 'localhost',
      port: 8005,
    },
  },
]),
  ],
  controllers: [InfoController],
})
export class InfoModule {}