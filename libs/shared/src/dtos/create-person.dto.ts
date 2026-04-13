import { IsString, IsEmail, IsNotEmpty, IsOptional, IsDate, IsEnum, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export class CreatePersonDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7, { message: 'Password must be at least 7 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  birthdate: Date;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}