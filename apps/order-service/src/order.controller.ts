import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern({ cmd: 'get_cart' })
  async getCart(@Payload() userId: number) {
    return this.orderService.getCurrentCart(userId);
  }

  @MessagePattern({ cmd: 'find_one_order' })
  async findOne(@Payload() id: number) {
    return this.orderService.findOne(id);
  }

  @MessagePattern({ cmd: 'find_all_orders' })
  async findAll() {
    return this.orderService.findAll();
  }

  @MessagePattern({ cmd: 'find_by_customer' })
  async findByCustomer(@Payload() customerId: number) {
    return this.orderService.findByCustomer(customerId);
  }

  @MessagePattern({ cmd: 'add_to_cart' })
  async addToCart(@Payload() data: { userId: number; productId: number }) {
    return this.orderService.addToCart(data.userId, data.productId);
  }

  @MessagePattern({ cmd: 'remove_item' })
  async removeItem(@Payload() data: { userId: number; productId: number }) {
    return this.orderService.removeItem(data.userId, data.productId);
  }

  @MessagePattern({ cmd: 'update_cart_quantity' })
  async updateQuantity(@Payload() data: { userId: number; productId: number; quantity: number }) {
    return this.orderService.updateQuantity(data.userId, data.productId, data.quantity);
  }

  @MessagePattern({ cmd: 'process_checkout' })
  async processCheckout(@Payload() userId: number) {
    return this.orderService.processCheckout(userId);
  }

  @MessagePattern({ cmd: 'find_active_orders' })
  async findActive() {
    return this.orderService.findActive();
  }

  @MessagePattern({ cmd: 'find_completed_orders' })
  async findCompleted() {
    return this.orderService.findCompleted();
  }

  @MessagePattern({ cmd: 'update_order_status' })
  async updateStatus(@Payload() data: { id: number; status: string }) {
    return this.orderService.updateStatus(data.id, data.status);
  }

  @MessagePattern({ cmd: 'delete_order' })
  async deleteOrder(@Payload() id: number) {
    return this.orderService.remove(id);
  }

  @MessagePattern({ cmd: 'cancel_order' })
  async cancelOrder(@Payload() id: number) {
    return this.orderService.cancelOrder(id);
  }
}