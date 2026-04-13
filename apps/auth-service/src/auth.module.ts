import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Person, Customer, Employee } from '@app/shared'; 

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'mysql-db', 
      port: 3306,
      username: 'root',
      password: 'admin',
      database: 'bookhaus_db', 
      entities: [Person, Customer, Employee],
      synchronize: false,
      logging: true,
    }),
    TypeOrmModule.forFeature([Person, Customer, Employee]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'my-super-secret-key-123',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}