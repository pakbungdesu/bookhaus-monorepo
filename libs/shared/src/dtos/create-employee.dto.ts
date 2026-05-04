import { IsNumber, IsString, IsDateString, IsDate, IsNotEmpty } from 'class-validator';
import { CreatePersonDto } from './create-person.dto';

export enum Position {
  MANAGER = 'Manager',
  DEVELOPER = 'Developer',
  SALES = 'Sales',
  DELIVERY = 'Delivery',
  INTERN = 'Intern',
}

export class CreateEmployeeDto extends CreatePersonDto {
  @IsNumber({}, { message: 'Salary must be a valid number' })
  @IsNotEmpty({ message: 'Salary is required' })
  salary: number;

  @IsString({ message: 'Position must be a string' })
  @IsNotEmpty({ message: 'Position is required' })
  position: string;

  @IsDateString({}, { message: 'Hire date must be a valid ISO date string' })
  @IsNotEmpty({ message: 'Hire date is required' })
  hiredate: string;
}
