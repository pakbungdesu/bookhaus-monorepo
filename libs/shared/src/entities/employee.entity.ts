import { Person } from './person.entity';
import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn} from 'typeorm';

@Entity('employee')
export class Employee {

  @PrimaryColumn()
  declare id: number;

  @OneToOne(() => Person, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  person: Person;
  
  @Column()
  salary: number;

  @Column()
  position: string;

  @Column({ type: 'date', nullable: true })
  hiredate: Date;
}
