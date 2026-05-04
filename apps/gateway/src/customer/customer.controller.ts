import { 
  Controller, Get, Post, Body, Param, Delete, 
  UseGuards, Render, Req, Res, Inject, UnauthorizedException,
  HttpCode, HttpStatus, NotFoundException,
  HttpException
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { JwtAuthGuard, Roles, RolesGuard } from '@app/shared';

@Controller('customer')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerController {
 constructor(
    @Inject('CUSTOMER_SERVICE') private readonly customerClient: ClientProxy,
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
  ) {}

  @Get('profile')
  @Roles('Customer')
  @Render('customer/profileCus')
  async getProfile(@Req() req) {
    const customerId = Number(req.user?.sub);
    if (!customerId) throw new UnauthorizedException('Please log in again.');

    const [customer, orderHistory] = await Promise.all([
      firstValueFrom(this.customerClient.send({ cmd: 'find_one_customer' }, customerId)),
      firstValueFrom(this.orderClient.send({ cmd: 'find_by_customer' }, customerId)).catch(() => [])
    ]);

    return { 
      customer, 
      orderHistory: orderHistory || [], 
      user: req.user 
    };
  }

  @Get('records')
  @Roles('Manager')
  @Render('employee/customerRecords')
  async getCustomerRecords(@Req() req) {
    // 1. Get all customers
    const customers = await firstValueFrom(
      this.customerClient.send({ cmd: 'find_all_customers' }, {})
    );

    // 2. Get all orders from the Order Microservice
    const allOrders = await firstValueFrom(
      this.orderClient.send({ cmd: 'find_all_orders' }, {})
    ).catch(() => []);

    // 3. Map order counts to customers
    const customersWithCounts = customers.map(cus => {
      const customerOrders = allOrders.filter(ord => ord.customerId === cus.id);
      return {
        ...cus,
        orderCount: customerOrders.length
      };
    });

    return { 
      customers: customersWithCounts, 
      user: req.user 
    };
  }

  @Get('edit')
  @Roles('Customer')
  @Render('customer/updateProfile')
  async getUpdateProfile(@Req() req){
    const customerId = Number(req.user?.sub);
    if (!customerId) throw new UnauthorizedException('Please log in again.');

    const customer = await firstValueFrom(
      this.customerClient.send({ cmd: 'find_one_customer' }, customerId)
    );

    return { 
      customer, 
      user: req.user 
    };
  }

  @Post()
  @Roles('Customer')
  @HttpCode(HttpStatus.OK) // Explicitly setting 200
  async updateProfile(@Body() updateData: any, @Req() req, @Res() res) {
    const userId = Number(req.user.sub);
    await firstValueFrom(
      this.customerClient.send({ cmd: 'update_customer' }, { id: userId, dto: updateData })
    );
    return res.redirect('/customer/profile');
  }

  @Delete(':id')
  @Roles('Manager')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 is standard for successful deletions
  async remove(@Param('id') id: string) {
    return this.customerClient.send({ cmd: 'delete_customer' }, +id);
  }

  @Get(':id')
  @Roles('Employee', 'Manager', 'Customer')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.customerClient.send({ cmd: 'find_one_customer' }, +id).pipe(
        catchError((err) => {
          const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
          const message = err.message || 'Error occurred in customer service';
          
          return throwError(() => new HttpException(message, status));
        })
      )
    );
  }
}