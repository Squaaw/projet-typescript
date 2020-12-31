export default class Role {
    private idRole: number;
    private nom: string | null;

    // name?:string signifie que type peut être optionnel
    constructor(id: number, name?:string){
        this.idRole = id;
        this.nom = (name === undefined) ? '' : name;
    }

    get id(): number{
        return this.idRole;
    }

    get name(): string {
        return (this.nom === null) ? '' : this.nom;
    }
}