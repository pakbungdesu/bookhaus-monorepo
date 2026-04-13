import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Person, CreateEmployeeDto, UpdateEmployeeDto, Employee } from '@app/shared';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EmployeeService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  async findAllEmployees(): Promise<Employee[]> {
    return await this.employeeRepository.find({
      relations: ['person'],
      order: { hiredate: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['person'],
    });
    if (!employee) throw new NotFoundException(`Employee #${id} not found`);
    return employee;
  }

  async create(createDto: CreateEmployeeDto): Promise<Employee> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createDto.password, salt);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const person = queryRunner.manager.create(Person, {
        ...createDto,
        password: hashedPassword,
        DTYPE: 'Employee',
      });
      const savedPerson = await queryRunner.manager.save(person);

      const employee = queryRunner.manager.create(Employee, {
        id: savedPerson.id,
        salary: createDto.salary,
        position: createDto.position,
        hiredate: createDto.hiredate
      });
      const savedEmployee = await queryRunner.manager.save(employee);

      await queryRunner.commitTransaction();
      return this.findOne(savedEmployee.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProfile(id: number, data: any) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['person']
    });

    if (!employee || !employee.person) {
      throw new NotFoundException('Employee record not found');
    }

    const { id: _, ...updateData } = data;
    Object.assign(employee.person, updateData);
    return await this.personRepository.save(employee.person);
  }

  async updateEmployeeForManager(id: number, updateDto: UpdateEmployeeDto) {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) throw new NotFoundException(`Employee #${id} not found`);

    const { position, salary, hiredate } = updateDto;
    if (position !== undefined) employee.position = position;
    if (salary !== undefined) employee.salary = parseFloat(salary as any);
    if (hiredate !== undefined) employee.hiredate = new Date(hiredate);

    return await this.employeeRepository.save(employee);
  }

  async remove(id: number) {
    const employee = await this.employeeRepository.findOne({ 
      where: { id },
      relations: ['person']
    });

    if (!employee) throw new NotFoundException(`Employee #${id} not found`);

    await this.dataSource.transaction(async (manager) => {
      await manager.remove(employee);
      if (employee.person) {
        await manager.remove(employee.person);
      }
    });
    return { deleted: true };
  }
}