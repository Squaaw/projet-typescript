import { UserInterface } from "./User";

export interface AccountInterface extends UserInterface{
    user_idUser: number | null | undefined;
    email: string;
    password: string;
}