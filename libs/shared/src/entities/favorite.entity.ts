// libs/shared/src/entities/favorite.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('favorite')
export class Favorite {
  @PrimaryGeneratedColumn({ name: 'favorite_id' })
  favoriteId: number;

  @Column({ name: 'customer_id' })
  customerId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @CreateDateColumn({ name: 'added_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  addedDate: Date;
  
  // We removed @ManyToOne Customer and Book.
  // When you need the data, the Gateway will call the Auth and Book services.
}