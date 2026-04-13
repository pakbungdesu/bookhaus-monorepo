import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FavoriteService } from './favorite-service.service';

@Controller()
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @MessagePattern({ cmd: 'get_favorites' })
  getFavorites(@Payload() userId: number) {
    return this.favoriteService.getFavorites(userId);
  }

  @MessagePattern({ cmd: 'add_favorite' })
  addFavorite(@Payload() data: { userId: number; productId: number }) {
    return this.favoriteService.addFavorite(data.userId, data.productId);
  }

  @MessagePattern({ cmd: 'remove_favorite' })
  removeFavorite(@Payload() data: { userId: number; productId: number }) {
    return this.favoriteService.removeFavorite(data.userId, data.productId);
  }
}