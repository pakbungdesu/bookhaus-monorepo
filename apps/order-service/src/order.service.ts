import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Order, OrderDetail, Book } from '@app/shared';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderDetail) private readonly detailRepo: Repository<OrderDetail>,
    @InjectRepository(Book) private readonly bookRepo: Repository<Book>,
    @Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientProxy,
    private dataSource: DataSource,
  ) {}

  // --- CART LOGIC ---

  async addToCart(userId: number, productId: number) {
    let order = await this.orderRepo.findOne({ where: { customerId: userId, status: 'Pending' } });

    if (!order) {
      order = await this.orderRepo.save(this.orderRepo.create({ 
        customerId: userId, 
        status: 'Pending', 
        orderTotal: 0 
      }));
    }
    
    const book = await this.inventoryClient.send({ cmd: 'find_one_book' }, productId).toPromise();
    if (!book) throw new NotFoundException('Book not found in inventory');

    let detail = await this.detailRepo.findOne({ where: { orderId: order.orderId, productId } });
    if (detail) {
      detail.quantity += 1;
    } else {
      detail = this.detailRepo.create({ 
        orderId: order.orderId, 
        productId, 
        quantity: 1, 
        unitPrice: book.price 
      });
    }
    await this.detailRepo.save(detail);
    await this.updateTotal(order.orderId);
    return { success: true };
  }

  async findAll() {
    return await this.orderRepo.find({
      relations: ['orderDetails'],
      order: { orderDate: 'DESC' }
    });
  }

  async removeItem(userId: number, productId: number) {
    const activeOrder = await this.orderRepo.findOne({
      where: { customerId: userId, status: 'Pending' },
      relations: ['orderDetails']
    });

    if (!activeOrder) throw new NotFoundException('No active cart found.');

    await this.detailRepo.delete({ orderId: activeOrder.orderId, productId });

    const remainingItems = await this.detailRepo.count({
      where: { orderId: activeOrder.orderId }
    });

    if (remainingItems === 0) {
      await this.orderRepo.delete(activeOrder.orderId);
      return { success: true, message: 'Cart emptied and order deleted' };
    }

    await this.updateTotal(activeOrder.orderId);
    return { success: true };
  }

  // Logic for the manual "Cancel" button
  async cancelOrder(userId: number) {
    const activeOrder = await this.orderRepo.findOne({
      where: { customerId: userId, status: 'Pending' }
    });
    
    if (activeOrder) {
      // This deletes the order and all its details (assuming Cascade delete is on)
      await this.orderRepo.remove(activeOrder);
    }
    return { success: true };
  }

  async updateQuantity(userId: number, productId: number, quantity: number) {
    const activeOrder = await this.orderRepo.findOne({
      where: { customerId: userId, status: 'Pending' }
    });

    if (!activeOrder) throw new NotFoundException('No active cart found.');

    if (quantity <= 0) {
      await this.detailRepo.delete({ orderId: activeOrder.orderId, productId });
    } else {
      await this.detailRepo.update(
        { orderId: activeOrder.orderId, productId },
        { quantity: quantity }
      );
    }
    await this.updateTotal(activeOrder.orderId);
    return { success: true };
  }

  async getCurrentCart(userId: number) {
    const order = await this.orderRepo.findOne({
      where: { customerId: userId, status: 'Pending' },
      relations: ['orderDetails', 'orderDetails.book'],
      order: { orderDate: 'DESC' }
    });
    return order?.orderDetails || [];
  }

  // --- CHECKOUT LOGIC ---

  async processCheckout(payload: any) {
    // 1. EXTRACT the numeric ID from the object
    const userId = payload.userId; 
    
    console.log('Actual User ID for query:', userId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        // 2. USE the extracted userId here
        where: { customerId: userId, status: 'Pending' }, 
        relations: ['orderDetails', 'orderDetails.book'],
        lock: { mode: 'pessimistic_write' }
      });

      if (!order || order.orderDetails.length === 0) throw new BadRequestException('Cart is empty');

      let actualTotal = 0;

      for (const item of order.orderDetails) {
        const book = await queryRunner.manager.findOne(Book, { 
          where: { productId: item.productId }, 
          lock: { mode: 'pessimistic_write' }
        });

        if (!book) {
            throw new BadRequestException(`Book with ID ${item.productId} not found.`);
        }

        if (book.stock < item.quantity) {
          throw new BadRequestException(`Out of stock: ${book.title}`);
        }

        // Update Stock
        book.stock -= item.quantity;
        await queryRunner.manager.save(book);
        
        // Ensure we use the current book price (in case it changed)
        actualTotal += Number(book.price) * item.quantity;
      }

      order.status = 'Paid';
      order.orderTotal = Number.parseFloat(actualTotal.toFixed(2));
      order.paymentId = order.orderId;
      order.orderDate = new Date();

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
      return savedOrder;

    } catch (err) {
      console.error('--- CHECKOUT ERROR DETAILS ---');
      console.error(err); 
      console.error('-------------------------------');
      
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // --- ORDER MANAGEMENT (For Employees/Managers) ---

  async findActive() {
    return this.orderRepo.find({
      where: { status: In(['Paid', 'Shipped']) },
      relations: ['orderDetails', 'orderDetails.book'],
      order: { orderDate: 'ASC' }
    });
  }

  async findCompleted() {
    return this.orderRepo.find({
      where: { status: 'Completed' },
      relations: ['orderDetails', 'orderDetails.book'],
      order: { orderDate: 'DESC' }
    });
  }

  async findByCustomer(customerId: number) {
    return await this.orderRepo.find({ 
      where: { customerId },
      relations: ['orderDetails', 'orderDetails.book'], 
      order: { orderDate: 'DESC' } 
    });
  }

  async updateStatus(id: number, status: string) {
    const order = await this.orderRepo.findOneBy({ orderId: id });
    if (!order) throw new NotFoundException('Order not found');

    // Logic: Only move to 'Completed' if it was 'Shipped'
    if (status === 'Completed' && order.status !== 'Shipped') {
        throw new BadRequestException('Cannot complete an order that has not been shipped yet.');
    }

    order.status = status;
    return this.orderRepo.save(order);
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({
      where: { orderId: id },
      relations: ['orderDetails', 'orderDetails.book']
    });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  async remove(id: number): Promise<{ deleted: boolean; id: number }> {
    const order = await this.orderRepo.findOneBy({ orderId: id });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found and could not be deleted.`);
    }

    if (order.status !== 'Pending') {
      throw new BadRequestException(
        `Order #${id} is already '${order.status}' and cannot be deleted.`
      );
    }

    await this.orderRepo.remove(order);
    return { deleted: true, id };
  }

  // --- INTERNAL HELPERS ---

  private async updateTotal(orderId: number) {
    const details = await this.detailRepo.find({ where: { orderId } });
    const total = details.reduce((sum, i) => sum + (Number(i.unitPrice) * i.quantity), 0);
    await this.orderRepo.update(orderId, { orderTotal: total });
  }
}