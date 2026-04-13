import { Controller, Get, Render, Req, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard, Roles, RolesGuard } from '@app/shared';
import { firstValueFrom } from 'rxjs';

@Controller('info')
@UseGuards(JwtAuthGuard)
export class InfoController {
  constructor(
    @Inject('INFO_SERVICE') private readonly infoClient: ClientProxy,
  ) {}

  private async getMicroserviceInfo() {
    try {
      return await firstValueFrom(this.infoClient.send({ cmd: 'get_app_info' }, {}));
    } catch (err) {
      return { 
        description: 'Welcome to Bookhaus!', 
        status: 'Offline' 
      };
    }
  }

  @Get('home')
  @Render('homePage')
  async homePage(@Req() req) {
    const info = await this.getMicroserviceInfo();
    return { 
      title: 'Home',
      description: info.description,
      user: req.user
    };
  }

  @Get('about')
  @Render('about')
  async aboutPage(@Req() req) {
    const info = await this.getMicroserviceInfo();
    return { 
      title: 'About Us',
      description: info.aboutText || 'Learn more about our story.',
      user: req.user
    };
  }

  @Get('contact')
  @Render('contact')
  async contactPage(@Req() req) {
    return { 
      title: 'Contact Us',
      description: 'Get in touch with Bookhaus!',
      user: req.user
    };
  }

  @Get('service')
  @Render('service')
  async servicePage(@Req() req) {
    return { 
      title: 'Our Services',
      description: 'Check out what Bookhaus has to offer!',
      user: req.user
    };
  }
}