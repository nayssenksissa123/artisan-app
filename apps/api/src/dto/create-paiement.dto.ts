import { IsNumber, IsString, IsOptional, IsIn } from 'class-validator';

export class CreatePaiementDto {
  @IsNumber()
  montant: number;

  @IsString()
  methode: string;

  @IsOptional()
  @IsIn(['EN_ATTENTE', 'VALIDE', 'ECHOUE', 'REMBOURSE'])
  statut?: string;

  @IsNumber()
  demandeId: number;
}
