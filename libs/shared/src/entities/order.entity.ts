import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { OrderDetail } from './order-detail.entity';

@Entity({ name: 'order' })
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'order_total', type: 'float' })
  orderTotal: number;

  @CreateDateColumn({ name: 'order_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  orderDate: Date;

  @Column({ name: 'customer_id' })
  customerId: number;

  @Column({ name: 'payment_id', nullable: true })
  paymentId: number;

  @Column({ default: 'Pending' })
  status: string;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetail[];
}