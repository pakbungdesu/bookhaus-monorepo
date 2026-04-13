import { Controller, Get, Post, Body, Req, Render, Inject, Param, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard, Roles, RolesGuard } from '@app/shared';

@Controller('favorite')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FavoriteController {
  constructor(
    @Inject('FAVORITE_SERVICE') private readonly favoriteClient: ClientProxy,
    @Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientProxy, // Inject Inventory
  ) {}

  @Get('wishlist')
  @Render('customer/favorite')
  @Roles('Customer')
  async findAll(@Req() req) {
    const userId = Number(req.user.sub);

    // 1. Get raw favorites (IDs) from Favorite Microservice
    const favoriteRecords = await firstValueFrom(
      this.favoriteClient.send({ cmd: 'get_favorites' }, userId)
    );

    // 2. Aggregate Data: Fetch book details for each favorite from Inventory Service
    // We use Promise.all to fetch them in parallel for speed
    const favoritesWithBooks = await Promise.all(
      favoriteRecords.map(async (fav: any) => {
        try {
          const book = await firstValueFrom(
            this.inventoryClient.send({ cmd: 'find_one_book' }, fav.productId)
          );
          return { ...fav, book }; // Merge book data into the favorite object
        } catch (err) {
          console.error(`Book ID ${fav.productId} not found in Inventory`);
          return { ...fav, book: null }; // Handle deleted books gracefully
        }
      })
    );

    // 3. Return combined data + user session for the Navbar
    return { 
      favorites: favoritesWithBooks, 
      user: req.user 
    };
  }

  @Post('add/:productId')
  @Roles('Customer')
  async add(@Param('productId') productId: string, @Req() req) {
    const payload = { 
      userId: Number(req.user.sub), 
      productId: Number(productId) 
    };

    const result = await firstValueFrom(
      this.favoriteClient.send({ cmd: 'add_favorite' }, payload)
    );
    
    return { success: true, message: 'Added to wishlist!', data: result };
  }

  @Post('remove')
  @Roles('Customer')
  async remove(@Body('productId') productId: string, @Req() req) {
    const payload = { 
      userId: Number(req.user.sub), 
      productId: Number(productId) 
    };

    await firstValueFrom(
      this.favoriteClient.send({ cmd: 'remove_favorite' }, payload)
    );
    
    return { success: true, message: 'Removed from wishlist' };
  }
}