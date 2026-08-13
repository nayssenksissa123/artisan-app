import { IsNotEmpty, IsNumber, IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateAvisDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  note: number;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @IsNotEmpty()
  @IsNumber()
  artisanId: number;

  @IsNotEmpty()
  @IsNumber()
  demandeId: number;
}
