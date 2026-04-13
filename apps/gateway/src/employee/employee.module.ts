import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EmployeeController } from './employee.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'EMPLOYEE_SERVICE',
        transport: Transport.TCP,
        options: { host: 'employee-service', port: 8007 },
      },
    ]),
  ],
  controllers: [EmployeeController],
})
export class EmployeeModule {}