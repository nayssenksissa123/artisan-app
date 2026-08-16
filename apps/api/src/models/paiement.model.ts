export interface Paiement {
  id: number;
  montant: number;
  methode: string;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'ECHOUE' | 'REMBOURSE';
  datePaiement: Date;
  demandeId: number;
}
