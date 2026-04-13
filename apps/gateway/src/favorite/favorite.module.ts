import { Module } from '@nestjs/common';
import { FavoriteController } from './favorite.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
  {
    name: 'FAVORITE_SERVICE',
    transport: Transport.TCP,
    options: {
      host: process.env.FAVORITE_HOST || 'localhost',
      port: 8006,
    },
  },
  {
    name: 'INVENTORY_SERVICE',
    transport: Transport.TCP,
    options: {
      host: process.env.INVENTORY_HOST || 'localhost',
      port: 8002,
    },
  },
]),
  ],
  controllers: [FavoriteController],
})
export class FavoriteModule {}