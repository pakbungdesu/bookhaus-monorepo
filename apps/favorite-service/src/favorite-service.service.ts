import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '@app/shared';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async addFavorite(userId: number, productId: number) {
    // 1. Check if already favorited
    const existing = await this.favoriteRepository.findOne({
      where: { customerId: userId, productId },
    });
    
    if (existing) {
      throw new BadRequestException('This book is already in your wishlist');
    }

    // 2. Create and save favorite record
    const favorite = this.favoriteRepository.create({
      customerId: userId,
      productId: productId,
    });

    return await this.favoriteRepository.save(favorite);
  }

  async getFavorites(userId: number) {
    // 3. Only return the favorite metadata (IDs and Dates)
    return await this.favoriteRepository.find({
      where: { customerId: userId },
      // 🛡️ Relations removed because 'book' isn't in this DB
      order: { addedDate: 'DESC' } 
    });
  }

  async removeFavorite(userId: number, productId: number) {
    const favorite = await this.favoriteRepository.findOne({
      where: { 
        customerId: userId, 
        productId: productId 
      }
    });

    if (!favorite) {
      throw new NotFoundException('Item not found in wishlist');
    }

    return await this.favoriteRepository.remove(favorite);
  }
}