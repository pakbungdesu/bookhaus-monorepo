import { 
  Controller, Get, Post, Body, Param, Delete, Query, 
  UseGuards, Render, Res, Req, HttpCode, HttpStatus, Inject, NotFoundException, 
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/shared';
import { Response } from 'express';

@Controller('order')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(
    @Inject('ORDER_SERVICE') private readonly client: ClientProxy,
    @Inject('CUSTOMER_SERVICE') private readonly customerClient: ClientProxy
  ) {}


  @Post('update-status/:id')
  @Roles('Employee', 'Manager', 'Customer') // Allow Customer to 'Complete' their own order
  async updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() req) {
    const payload = { 
        id: +id, 
        status, 
        userId: Number(req.user.sub),
        userRole: req.user.DTYPE 
    };

    return await firstValueFrom(
      this.client.send({ cmd: 'update_order_status' }, payload)
    );
  }


  // --- CUSTOMER VIEWS ---

  @Post('checkout')
  @Roles('Customer')
  async checkout(@Req() req, @Res() res: Response) {
    const userId = Number(req.user.sub);
    
    const cart = await firstValueFrom(this.client.send({ cmd: 'get_cart' }, userId));
    
    if (!cart || cart.length === 0) {
        return res.redirect('/order/cart?error=empty');
    }

    const orderId = cart[0].orderId;
    return res.redirect(`/order/payment/${orderId}`);
  }

  @Get('success')
  @Roles('Customer')
  @Render('customer/orderSuccess')
  async showSuccess(@Query('id') orderId: string, @Req() req) {
      const order = await firstValueFrom(
      this.client.send({ cmd: 'find_one_order' }, +orderId)
    );
    
    if (!order) throw new NotFoundException('Order not found');

    const customer = await firstValueFrom(
      this.customerClient.send({ cmd: 'find_one_customer' }, order.customerId)
    ).catch(() => null);

    return { order, customer, user: req.user };
  }

  @Get('cart')
  @Roles('Customer')
  @Render('customer/cart')
  async viewCart(@Req() req) {
    const cart = await firstValueFrom(
      this.client.send({ cmd: 'get_cart' }, Number(req.user.sub))
    ).catch(() => []);

    // Logic for calculating total lives in the Gateway (UI logic)
    const cartTotal = cart.reduce((sum, item) => {
      return sum + (Number(item.unitPrice) * item.quantity);
    }, 0);

    return { cart, cartTotal, user: req.user };
  }

  // Show the QR Code Page
  @Get('payment/:id')
  @Roles('Customer')
  @Render('customer/payment')
  async showPayment(@Param('id') orderId: string, @Req() req) {
    return { orderId, user: req.user };
  }


  @Post('payment/confirm')
  @Roles('Customer')
  async confirmPayment(@Body('id') orderId: string, @Req() req) {
    const payload = { 
      userId: Number(req.user.sub), 
      orderId: Number(orderId) 
    };

    const completedOrder = await firstValueFrom(
      this.client.send({ cmd: 'process_checkout' }, payload)
    );
    
    return { success: true, redirectUrl: `/order/success?orderId=${completedOrder.orderId}` };
  }

  @Post('add/:id')
  @Roles('Customer')
  async addToCart(@Param('id') productId: string, @Req() req) {
    try {
      const userId = Number(req.user?.sub);
      const pid = Number(productId);

      if (!userId || !pid) {
        throw new BadRequestException('Invalid User or Product ID');
      }

      const payload = { userId: userId, productId: pid };
      
      // Set a timeout so the gateway doesn't hang indefinitely
      return await firstValueFrom(this.client.send({ cmd: 'add_to_cart' }, payload));
    } catch (err) {
      console.error('Order Service Error:', err);
      // Return a 500 status with a JSON message instead of crashing
      throw new InternalServerErrorException( err instanceof Error ? err.message : 'Order service unreachable');
    }
  }

  @Post('cart/remove')
  @Roles('Customer')
  // REMOVE "@Res() res: Response" from the parameters here
  async removeFromCart(@Body('id') productId: string, @Req() req) { 
    const payload = { 
      userId: Number(req.user.sub), 
      productId: +productId, 
      userRole: req.user.DTYPE 
    };
    
    try {
      await firstValueFrom(this.client.send({ cmd: 'remove_item' }, payload));
      return { success: true }; // NestJS will now automatically send this as JSON
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  @Post('cart/update')
  @Roles('Customer')
  // REMOVE "@Res() res: Response" from the parameters here
  async updateCartQuantity(@Body() data: { productId: string; quantity: string }, @Req() req) {

    if (!data.productId || !data.quantity) throw new BadRequestException('Invalid data');

    const payload = { 
      userId: Number(req.user.sub), 
      productId: Number(data.productId), 
      quantity: Number(data.quantity) 
    };

    try {
      await firstValueFrom(this.client.send({ cmd: 'update_cart_quantity' }, payload));
      return { success: true }; 
    } catch (err) {
      return { success: false };
    }
  }

  @Delete(':id')
  @Roles('Customer','Manager')
  async remove(@Param('id') id: string, @Req() req) {
    return await firstValueFrom(
      this.client.send({ cmd: 'delete_order' }, { id: +id, userRole: req.user.DTYPE })
    );
  }

  @Post('cart/cancel')
  @Roles('Customer')
  async cancelCart(@Req() req) {
    const userId = Number(req.user.sub);
    await firstValueFrom(this.client.send({ cmd: 'cancel_order' }, userId));
    return { success: true };
  }

  // --- EMPLOYEE ---

  @Get('completed')
  @Roles('Manager')
  @Render('employee/salesCompleted')
  async getCompletedOrders(@Req() req) {
    const historyOrders = await firstValueFrom(
      this.client.send({ cmd: 'find_completed_orders' }, { userRole: req.user.DTYPE })
    ).catch(() => []);

    const totalRevenue = historyOrders.reduce((sum, ord) => sum + (ord.orderTotal || 0), 0);
    
    return { 
      historyOrders, 
      totalRevenue, 
      user: req.user 
    };
  }

  @Get('history')
  @Roles('Employee', 'Manager')
  @Render('employee/customerHistory')
  async getCustomerHistory(@Query('id') customerId: string, @Req() req) {
    if (!customerId) throw new BadRequestException('Customer ID is required');

    const [customer, orderHistory] = await Promise.all([
        firstValueFrom(this.customerClient.send({ cmd: 'find_one_customer' }, customerId)),
        firstValueFrom(this.client.send({ cmd: 'find_by_customer' }, customerId)).catch(() => [])
      ]);

    console.log(customer);
    console.log(orderHistory);

    const totalRevenue = orderHistory.reduce((acc, ord) => acc + Number(ord.orderTotal), 0);

    return { orderHistory, totalRevenue, customer, user: req.user };
  }

  @Get('customer/:id')
  @Roles('Employee', 'Manager')
  async getCustomerData(@Param('id') customerId: string) {
    const customer = firstValueFrom(this.client.send({ cmd: 'find_by_customer' }, customerId)).catch(() => []);
    return {customer: customer}
  }

  @Get('active')
  @Roles('Employee', 'Manager')
  @Render('employee/activeOrder')
  async getActiveOrders(@Req() req) {
    // Request active orders from Microservice
    const orders = await firstValueFrom(
      this.client.send({ cmd: 'find_active_orders' }, { userRole: req.user.DTYPE })
    ).catch(() => []); // Fallback to empty list if service is down

    return { orders, user: req.user };
  }

  @Get(':id')
  @Roles('Employee', 'Manager', 'Customer')
  async getOrder(@Param('id') id: string) {
      return await firstValueFrom(
          this.client.send({ cmd: 'find_one_order' }, +id)
      );
  }
}