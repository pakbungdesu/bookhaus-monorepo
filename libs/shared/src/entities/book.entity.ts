import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'book' })
export class Book {
  @PrimaryGeneratedColumn({ name: 'product_id' })
  productId: number;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ nullable: true })
  year: number;

  @Column({ nullable: true })
  genre: string;

  @Column({ nullable: true })
  subgenre: string;

  @Column({ nullable: true })
  page: number;

  @Column({ name: 'avg_rating', type: 'float', nullable: true })
  avgRating: number;

  @Column({ type: 'float' })
  price: number;

  @Column({ length: 1000, nullable: true })
  description: string;

  @Column({ type: 'longblob', nullable: true })
  photo: Buffer;

  @Column()
  stock: number;
}