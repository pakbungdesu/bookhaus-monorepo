import { IsNumber, IsString, IsDateString } from 'class-validator';
import { CreatePersonDto } from './create-person.dto';

export class CreateEmployeeDto extends CreatePersonDto {
  @IsNumber() salary: number;
  @IsString() position: string;
  @IsDateString() hiredate: string;
}
