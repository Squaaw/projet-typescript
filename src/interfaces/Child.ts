import { UserInterface } from "./User";

export interface ChildInterface extends UserInterface{
    child_id: number | null | undefined;
    tutor_id: number;
}