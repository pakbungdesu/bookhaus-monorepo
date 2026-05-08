import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Book } from '@app/shared';

@Injectable()
export class InventoryService {
  constructor(@InjectRepository(Book) private readonly repo: Repository<Book>) {}

  async findAll(query: any = {}) { 
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 12;
    const { title, author, genre } = query;

    const where: any = {};
    
    if (title) where.title = Like(`%${title}%`);
    if (author) where.author = Like(`%${author}%`);
    if (genre && genre !== 'All Genres') where.genre = genre;

    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { productId: 'DESC' }
    });

    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return this.repo.findOneBy({ productId: id });
  }

  async create(dto: any, file?: any) {
    const book = this.repo.create(dto as Partial<Book>);
    
    return this.repo.save(book);
  }

  async update(id: number, dto: any) {
    const book = await this.repo.preload({ 
      productId: id, // Ensure this matches your Book entity @PrimaryColumn
      ...dto 
    });

    if (!book) throw new NotFoundException(`Book #${id} not found`);
    return this.repo.save(book);
  }

  async remove(id: number) {
    const book = await this.findOne(id);
    if (book) await this.repo.remove(book);
    return { deleted: true };
  }
}