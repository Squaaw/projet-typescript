import MySQL from '../db/MySQL';

export default class Role {
    private idRole: number;
    private name: string | null;

    // name?:string signifie que name peut être optionnel
    constructor(id: number, name?:string){
        this.idRole = id;
        this.name = (name === undefined) ? '' : name;
    }

    get id(): number{
        return this.idRole;
    }

    get nom(): string {
        return (this.name === null) ? '' : this.name;
    }
}