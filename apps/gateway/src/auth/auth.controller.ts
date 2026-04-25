import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Get, 
  Render, 
  Res, 
  Inject, 
  UnauthorizedException 
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';
import { lastValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private client: ClientProxy,
  ) {}

  @Get('login/cust')
  @Render('customer/loginCus')
  showCusLogin() { return { title: 'Customer Login' }; }

  @Get('login/emp')
  @Render('employee/loginEmp')
  showEmpLogin() { return { title: 'Employee Login' }; }

  @Get('register/cust')
  @Render('customer/regCus')
  showCusReg() { return { title: 'Register Customer' }; }

  @Get('register/emp')
  @Render('employee/regEmp')
  showEmpReg() { return { title: 'Register Employee' }; }


  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: any, @Res() res: Response) {
    try {
      // 1. Send the login request to the Auth Microservice via TCP
      const result = await lastValueFrom(
        this.client.send({ cmd: 'auth_login' }, loginDto)
      );

      if (!result || !result.access_token) {
        return res.redirect('/auth/login/cust?error=Invalid Credentials');
      }

      // 2. Set the JWT inside an HTTP-only Cookie
      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        maxAge: 3600000, // 1 hour
      });

      // 3. Redirect based on the User Role (DTYPE)
      const user = result.user;
      if (user.DTYPE === 'Customer') {
        // Pass the user object here!
        return res.render('homePage', { user }); 
      } else {
        // Pass the user object here!
        return res.render('homePage', { user });
      }

    } catch (error) {
      console.error('Login Error:', error);
      return res.redirect('/auth/login/cust?error=Internal Server Error');
    }
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.redirect('/');
  }

  @Post('register/cust')
  async registerCustomer(@Body() dto: any, @Res() res: Response) {
    try {
      await lastValueFrom(
        this.client.send({ cmd: 'register_customer' }, dto)
      );
      return res.redirect('/auth/login/cust?success=Registration successful');
    } catch (err) {
      return res.render('customer/regCus', { error: 'Registration failed. Try again.' });
    }
  }

  @Post('register/emp')
  async registerEmployee(@Body() dto: any, @Res() res: Response) {
    try {
      await lastValueFrom(
        this.client.send({ cmd: 'register_employee' }, dto)
      );
      return res.redirect('/auth/login/emp?success=Staff registered');
    } catch (err) {
      return res.render('employee/regEmp', { error: 'Registration failed.' });
    }
  }
}