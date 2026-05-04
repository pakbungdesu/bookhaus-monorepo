import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateCustomerDto, Customer, Person, UpdateCustomerDto } from '@app/shared'; // Using shared entities


@Injectable()
export class CustomerService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  // 1. Find All
  async findAllCustomers(): Promise<Customer[] | null> {
    return await this.customerRepository.find({
      relations: ['person'], // Removed 'orders'
    });
  }

  // 2. Find One
  async findOne(id: number): Promise<Customer | null> {
    return await this.customerRepository.findOne({
      where: { id },
      relations: ['person'], // Removed 'orders'
    });
  }

  // 3. Find By Email
  async findByEmail(email: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({
      where: { person: { email } },
      relations: ['person'],
    });
  }

  // 4. Create - Transactional
  async create(createDto: CreateCustomerDto): Promise<Customer | any> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createDto.password, salt);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create Base Person
      const person = queryRunner.manager.create(Person, {
        ...createDto,
        password: hashedPassword,
        DTYPE: 'Customer',
      });
      const savedPerson = await queryRunner.manager.save(person);

      // Create Customer linked by ID
      const customer = queryRunner.manager.create(Customer, {
        id: savedPerson.id,
      });
      const savedCustomer = await queryRunner.manager.save(customer);

      await queryRunner.commitTransaction();
      return this.findOne(savedCustomer.id);

   } catch (err) {
      await queryRunner.rollbackTransaction();
      
      if ((err as any).code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email or unique field is already in use');
      }
      
      throw err;
    }
  }

  // 5. Update
  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const { 
      firstname, lastname, email, birthdate, gender, address, phone, 
      ...customerFields 
    } = updateCustomerDto;

    const customer = await this.customerRepository.preload({
      id: id,
      ...customerFields,
      person: {
        id: id, 
        firstname, lastname, email, birthdate, gender, address, phone,
      },
    });

    if (!customer){
      throw new NotFoundException('Customer with ID ${id} not found');
    }

    try {
      return await this.customerRepository.save(customer);
    } catch (error) {
      if ((error as any).code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email or unique field is already in use');
      }
      throw error;
    }
  }

  // 6. Remove
  async remove(id: number) {
    const customer = await this.findOne(id);
    if (!customer) return null;

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.remove(customer);
        if (customer.person) {
          await manager.remove(customer.person);
        }
      });

      return { success: true, message: 'Customer with ID ${id} successfully deleted' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete customer due to a database error');
    }
  }
}