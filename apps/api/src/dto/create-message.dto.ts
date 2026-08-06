import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  contenu: string;

  @IsNotEmpty()
  @IsNumber()
  demandeId: number;

  @IsNotEmpty()
  @IsNumber()
  expediteurId: number;
}
