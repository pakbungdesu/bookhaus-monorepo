import { Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Person } from './person.entity';
import { Order } from './order.entity';

@Entity('customer')
export class Customer {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => Person, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  person: Person;
}