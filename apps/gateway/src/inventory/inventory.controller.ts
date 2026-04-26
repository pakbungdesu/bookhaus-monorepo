import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query, 
  UseInterceptors, UploadedFile, Render, NotFoundException, 
  Res, UseGuards, Req, Inject 
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs'; // Use firstValueFrom for consistency
import { JwtAuthGuard, Roles, RolesGuard } from '@app/shared';

@Controller('book')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(
    @Inject('INVENTORY_SERVICE') private readonly client: ClientProxy
  ) {}

  private readonly genres = [
    "Classic", "Science Fiction", "Fiction", "Technology", "Young Adult", 
    "Fantasy", "Horror", "Thriller", "Non-Fiction", "Mystery", "Children", "Philosophy"
  ];

  // --- EMPLOYEE/MANAGER VIEWS ---

  @Get('add')
  @Roles('Employee', 'Manager')
  @Render('employee/addBook')
  async showAddNewBookPage(@Req() req) {
    return { genres: this.genres, user: req.user };
  }

  @Get('edit')
  async editBook(@Query() query: any, @Req() req, @Res() res) {
    const result = await firstValueFrom(
      this.client.send({ cmd: 'find_all_books' }, {
        page: query.page || 1,
        limit: 12,
        title: query.title || '',
        author: query.author || '',
        genre: query.genre || ''
      })
    );

    const data = { 
      user: req.user || null,
      books: result.data, 
      pagination: {
        current: result.currentPage,
        total: result.totalPages,
        totalItems: result.total
      },
      filters: query 
    };

    // Detect AJAX (XMLHttpRequest)
    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      // Render ONLY the partial file
      return res.render('partials/bookCards', data);
    }

    return res.render('product', data);
  }

  @Get('edit-view/:id')
  @Roles('Employee', 'Manager')
  @Render('employee/editView')
  async showEditPage(@Param('id') id: string) {
    const book = await firstValueFrom(this.client.send({ cmd: 'find_one_book' }, +id));
    return { book, genres: this.genres };
  }

  // --- CUSTOMER / PUBLIC VIEWS ---

  @Get('search')
  async searchBooks(@Query() query: any, @Req() req, @Res() res) {
    const result = await firstValueFrom(
      this.client.send({ cmd: 'find_all_books' }, {
        page: Number(query.page) || 1,
        limit: 12,
        title: query.title || '',
        author: query.author || '',
        genre: query.genre || ''
      })
    );

    const data = { 
      user: req.user || null,
      books: result.data, 
      pagination: {
        current: result.currentPage,
        total: result.totalPages,
        totalItems: result.total
      },
      filters: query 
    };

    // Detect AJAX (XMLHttpRequest)
    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      // Render ONLY the partial file
      return res.render('partials/bookCards', data);
    }

    return res.render('product', data);
  }


  @Get('view/:id')
  @Render('viewBook')
  async viewPage(@Param('id') id: string, @Req() req) {
    const book = await firstValueFrom(this.client.send({ cmd: 'find_one_book' }, +id));
    return { book, user: req.user };
  }

  // --- IMAGE STREAMING ---
  @Get('image/:id')
  async getBookImage(@Param('id') id: string, @Res() res: Response) {
    const book = await firstValueFrom(this.client.send({ cmd: 'find_one_book' }, +id));
    
    if (!book || !book.photo) {
      throw new NotFoundException('Image not found');
    }

    const imageBuffer = Buffer.from(book.photo);
    res.setHeader('Content-Type', 'image/jpeg'); 
    return res.send(imageBuffer);
  }

  // --- LOGIC (MUTATIONS) ---

  @Post()
  @Roles('Employee', 'Manager')
  @UseInterceptors(FileInterceptor('photo'))
  async create(@Body() dto: any, @UploadedFile() file: Express.Multer.File, @Res() res,@Req() req) {
    try {
      console.log(file);
      
      await firstValueFrom(
        this.client.send({ cmd: 'create_book' }, { 
          dto, 
          file: file? {
                buffer: file.buffer.toString('base64'),
                originalname: file.originalname,
                mimetype: file.mimetype,
              }
            : null
        })
      );
      return res.redirect('/book/addBook?status=success');
    } catch (err) {
      return res.render('employee/addBook', { 
        status: 'error',
        error: 'Failed to create book.',
        genres: this.genres,
        user: req.user 
      });
    }
  }

  @Delete(':id')
  @Roles('Manager')
  async remove(@Param('id') id: string) {
    // Note: If you don't 'await' here, the request is sent, but the Gateway 
    // won't wait for the confirmation. Best to use firstValueFrom here too.
    return await firstValueFrom(this.client.send({ cmd: 'delete_book' }, +id));
  }

  @Patch(':id')
  @Roles('Manager')
  async update(@Param('id') id: string) {
    return await firstValueFrom(this.client.send({ cmd: 'update_book' }, +id));
  }

}