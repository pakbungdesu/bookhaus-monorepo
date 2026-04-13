import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrderModule } from './order/order.module';
import { InfoModule } from './info/info.module';
import { CustomerModule } from './customer/customer.module';
import { FavoriteModule } from './favorite/favorite.module';
import { EmployeeModule } from './employee/employee.module';
import { AppController } from './app/app.controller';

@Module({
  imports: [
    JwtModule.register({
      global: true, 
      secret: process.env.JWT_SECRET || 'my-super-secret-key-123',
      signOptions: { expiresIn: '1h' },
    }),
    AuthModule,      
    InventoryModule, 
    OrderModule,
    InfoModule,
    CustomerModule,
    FavoriteModule,
    EmployeeModule      
  ],
  controllers: [AppController], 
})
export class GatewayModule {}