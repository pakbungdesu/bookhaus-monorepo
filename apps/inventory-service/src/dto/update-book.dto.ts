import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryDto } from './create-book.dto';

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {}
