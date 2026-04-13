import { Injectable } from '@nestjs/common';

@Injectable()
export class InfoService {
  getHello(): string {
    return 'Hello World!';
  }
}
