import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth_login' })
  async login(@Payload() data: any) {
    return this.authService.login(data.email, data.password);
  }

  @MessagePattern({ cmd: 'auth_register_customer' })
  async registerCustomer(@Payload() customerDto: any) {
    return this.authService.createCustomer(customerDto);
  }

  @MessagePattern({ cmd: 'auth_register_employee' })
  async registerEmployee(@Payload() employeeDto: any) {
    return this.authService.createEmployee(employeeDto);
  }
}