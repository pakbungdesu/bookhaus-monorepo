import { Injectable} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Person, Employee, Customer } from '@app/shared';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const person = await this.personRepository.findOne({ where: { email } });
    
    if (!person || !(await bcrypt.compare(pass, person.password))) {
      return null; 
    }

    let position: string | null = null;

    // 2. Fetch position ONLY if they are an Employee
    if (person.DTYPE === 'Employee') {
      const employeeData = await this.employeeRepository.findOne({ 
        where: { id: person.id } 
      });
      position = employeeData?.position || null; 
    }

    // 3. Build the payload
    const payload = { 
      sub: person.id, 
      email: person.email, 
      DTYPE: person.DTYPE, 
      position: position 
    };

    console.log(payload ?? 'payload is null.');

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: person.id,
        firstname: person.firstname,
        DTYPE: person.DTYPE,
        position: position
      }
    };
  }

  // --- Add these for your registration logic ---
  async createCustomer(dto: any) {
    // Implement your customer creation logic here using 
    // this.personRepository and this.customerRepository
    return { success: true };
  }

  async createEmployee(dto: any) {
    // Implement your employee creation logic here
    return { success: true };
  }
}