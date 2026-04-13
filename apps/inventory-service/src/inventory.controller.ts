import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InventoryService } from './inventory.service';

@Controller()
export class InventoryController {
  constructor(private readonly bookService: InventoryService) {}

  @MessagePattern({ cmd: 'find_all_books' })
  findAll(@Payload() data: any) {
    return this.bookService.findAll(data);
  }

  @MessagePattern({ cmd: 'find_one_book' })
  findOne(@Payload() id: number) {
    return this.bookService.findOne(id);
  }

  @MessagePattern({ cmd: 'create_book' })
  createBook(data: any) {
  const { dto, file } = data;

  return this.bookService.create({
    ...dto,
    photo: file ? Buffer.from(file.buffer, 'base64') : null
  });
}

  @MessagePattern({ cmd: 'update_book' })
  update(@Payload() data: { id: number; dto: any }) {
    return this.bookService.update(data.id, data.dto);
  }

  @MessagePattern({ cmd: 'delete_book' })
  remove(@Payload() id: number) {
    return this.bookService.remove(id);
  }
}