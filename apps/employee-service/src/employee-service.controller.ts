import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmployeeService } from './employee-service.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from '@app/shared';

@Controller()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @MessagePattern({ cmd: 'find_all_employees' })
  findAll() {
    return this.employeeService.findAllEmployees();
  }

  @MessagePattern({ cmd: 'find_one_employee' })
  findOne(@Payload() id: number) {
    return this.employeeService.findOne(id);
  }

  @MessagePattern({ cmd: 'create_employee' })
  create(@Payload() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @MessagePattern({ cmd: 'update_employee_profile' })
  updateProfile(@Payload() data: { id: number; updateDto: any }) {
    return this.employeeService.updateProfile(data.id, data.updateDto);
  }

  @MessagePattern({ cmd: 'update_employee_manager' })
  updateForManager(@Payload() data: { id: number; updateDto: UpdateEmployeeDto }) {
    return this.employeeService.updateEmployeeForManager(data.id, data.updateDto);
  }

  @MessagePattern({ cmd: 'remove_employee' })
  remove(@Payload() id: number) {
    return this.employeeService.remove(id);
  }
}