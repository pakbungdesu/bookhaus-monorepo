import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomerService } from './customer-service.service';

@Controller()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @MessagePattern({ cmd: 'find_all_customers' })
  async findAll() {
    return this.customerService.findAllCustomers();
  }

  @MessagePattern({ cmd: 'find_one_customer' })
  async findOne(@Payload() id: number) {
    return this.customerService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_customer' })
  async update(@Payload() data: { id: number; dto: any }) {
    return this.customerService.update(data.id, data.dto);
  }

  @MessagePattern({ cmd: 'delete_customer' })
  async remove(@Payload() id: number) {
    return this.customerService.remove(id);
  }
}