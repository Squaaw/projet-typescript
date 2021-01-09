export interface BillInterface{
    idBill: number;
    id_Stripe: string;
    datePayment: string;
    montantHt: number;
    montantTtc: number;
    source: string;
    createdAt: string;
    updatedAt: string;
    idUser: number;
    capture: number;
}