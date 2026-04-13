import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Book } from '@app/shared';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'mysql-db', 
      port: 3306,
      username: 'root',
      password: 'admin',
      database: 'bookhaus_db',
      entities: [Book],
      synchronize: false,
      logging: true,
    }),
    TypeOrmModule.forFeature([Book]), 
  ],
  controllers: [InventoryController],
  providers: [InventoryService], 
})
export class InventoryModule {}