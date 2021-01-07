export interface UserInterface{
    idUser: number;
    firstname: string;
    lastname: string;
    gender: string;
    idRole: number;
    birthdate: string;
    createdAt: string;
    updatedAt: string;
    subscription: boolean;
    stripe_customerId: string | null;
}