import { IsEmail, IsNotEmpty, IsString, MinLength, IsDateString, IsIn } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsDateString()
  birthdate: string;

  @IsIn(['Male', 'Female', 'Other'])
  gender: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  phone: string;
}