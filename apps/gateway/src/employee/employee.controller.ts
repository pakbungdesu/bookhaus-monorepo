import { Controller, Get, Post, Body, Param, UseGuards, Render, Req, Res, Inject, Query, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard, Roles, RolesGuard } from '@app/shared';


@Controller('employee')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeController {
  constructor(@Inject('EMPLOYEE_SERVICE') private readonly client: ClientProxy) {}

  @Get('profile')
  @Roles('Employee', 'Manager')
  @Render('employee/profileEmp')
  async getProfile(@Req() req) {
    const employee = await firstValueFrom(
      this.client.send({ cmd: 'find_one_employee' }, req.user.sub)
    );
    return { employee, user: req.user };
  }

  @Get('update')
  @Roles('Employee', 'Manager')
  @Render('employee/updateProfile')
  async updateProfile(@Req() req) {
    const employee = await firstValueFrom(
      this.client.send({ cmd: 'find_one_employee' }, req.user.sub)
    );
    return { employee, user: req.user };
  }

  @Get('staff')
  @Roles('Employee', 'Manager')
  @Render('employee/staffDirectory')
  async getStaffDirectory(@Query('status') status: string, @Req() req) {
    const employees = await firstValueFrom(
      this.client.send({ cmd: 'find_all_employees' }, {})
    );
    return { 
        employees, 
        user: req.user, 
        status: status || null 
    };
  }

@Post('edit')
@Roles('Employee')
async editProfile(@Body() updateDto: any, @Req() req, @Res() res) {
    await firstValueFrom(
        this.client.send({ cmd: 'update_employee_profile' }, { id: req.user.sub, updateDto })
    );
    return res.redirect('/employee/profile');
}

  @Get('edit/:id')
  @Render('employee/editStaff')
  async showEditStaff(@Param('id') id: string, @Req() req) {
    const employee = await firstValueFrom(
      this.client.send({ cmd: 'find_one_employee' }, id)
    );
    return { employee, user: req.user };
  }

  @Post('update/:id')
  @Roles('Manager')
  async updateStaff(@Param('id') id: string, @Body() updateDto: any, @Res() res) {
    try {
        await firstValueFrom(
        this.client.send({ cmd: 'update_employee_manager' }, { 
            id: +id, 
            updateDto 
        })
        );

        return res.redirect('/employee/staff?status=updated');
    } catch (error) {
        console.error('Update Staff Error:', error);
        return res.redirect(`/employee/editStaff/${id}?error=Failed to update`);
    }
    }
}