import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  nom: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  motDePasse: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsIn(['CLIENT', 'ARTISAN'])
  role: 'CLIENT' | 'ARTISAN';
}