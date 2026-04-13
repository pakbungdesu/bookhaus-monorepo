import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices'; // Add these
import { FavoriteController } from './favorite-service.controller';
import { FavoriteService } from './favorite-service.service';
import { Favorite, Book } from '@app/shared';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'mysql-db',
      port: 3306,
      username: 'root',
      password: 'admin',
      database: 'bookhaus_db',
      autoLoadEntities: true,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Favorite, Book]),

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
  controllers: [FavoriteController],
  providers: [FavoriteService],
})
export class FavoriteModule {}