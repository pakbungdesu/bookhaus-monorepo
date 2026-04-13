import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, MaxLength, Min, Max } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Max(new Date().getFullYear())
  year: number;

  @IsString()
  @IsOptional()
  genre: string;

  @IsString()
  @IsOptional()
  subgenre: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  page: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  @Type(() => Number)
  avgRating: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock: number;
}
