import { IsString, IsEmail, IsNotEmpty, IsOptional, IsDate, IsEnum, MinLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export class CreatePersonDto {

  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(7, { message: 'Password must be at least 7 characters long' })
  password: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @Matches(/^[a-zA-Z][a-zA-Z]{1,98}$/, {
    message: 'First name must start with a letter and contain only letters.',
  })
  firstname: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
    @Matches(/^[a-zA-Z][a-zA-Z]{1,98}$/, {
    message: 'Last name must start with a letter and contain only letters.',
  })
  lastname: string;

  @IsDate({ message: 'Birthdate must be a valid date' })
  @IsNotEmpty({ message: 'Birthdate is required' })
  @Type(() => Date)
  birthdate: Date;

  @IsEnum(Gender, { message: 'Gender must be Male, Female, or Other' })
  @IsNotEmpty({ message: 'Gender is required' })
  gender: Gender;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: 'Phone number must contain only digits and can optionally start with a +.',
  })
  phone?: string;
}