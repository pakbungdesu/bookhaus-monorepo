import { Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Person } from './person.entity';

@Entity('customer')
export class Customer {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => Person, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  person: Person;
  
  // Note: We removed the 'orders' relationship here because 
  // orders live in a different service/database.
}