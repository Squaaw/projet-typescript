export interface BillInterface{
    idBill: number;
    id_stripe: number;
    datePayment: string;
    montantHt: number;
    montantTtc: number;
    source: string;
    createdAt: string;
    updatedAt: string;
    user_idUser: number;
}