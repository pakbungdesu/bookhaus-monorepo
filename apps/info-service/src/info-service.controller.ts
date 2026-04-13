import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class InfoController {
  @MessagePattern({ cmd: 'get_app_info' })
  getAppInfo() {
    return {
      name: 'Bookhaus Online Bookstore',
      version: '2.0.0 (Microservices)',
      description: 'Your favorite story, delivered.',
      status: 'Operating Normally'
    };
  }
}