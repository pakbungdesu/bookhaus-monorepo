import { IsNumber, IsArray, ValidateNested, IsString, IsNotEmpty, IsPositive, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber({}, { message: 'Product ID must be a number' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: number;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be greater than zero' })
  @IsNotEmpty({ message: 'Quantity is required' })
  quantity: number;
}

export class CreateOrderDto {
  @IsArray({ message: 'Items must be an array' })
  @ArrayNotEmpty({ message: 'The order must contain at least one item' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
