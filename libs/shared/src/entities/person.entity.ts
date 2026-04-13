import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('person')
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() firstname: string;
  @Column() lastname: string;
  @Column({ unique: true }) email: string;
  @Column({ type: 'date' }) birthdate: Date;
  @Column() gender: string;
  @Column() password: string;
  @Column() address: string;
  @Column() phone: string;
  @Column() DTYPE: string;
}