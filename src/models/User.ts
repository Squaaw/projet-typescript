import Role from './Role';

export default class User{

    protected idUser ? : number | null;
    public prenom: string | null;
    public nom: string | null;
    public sexe: string | null;
    public idRole: number | null;
    public dateNaissance: string | null;
    public dateCreation: string | null;
    public dateMaj: string | null;
    public abonnement: boolean | null;

    protected table: string = 'user';

    constructor(user: User | null, firstname: string = '', lastname: string = '', sexe: string = '', idRole: number = 1, dateNaissance: string = '', createdAt: string = '', updatedAt: string = '', subscription: boolean = false){
        if (user === null){
            this.prenom = firstname;
            this.nom = lastname;
            this.sexe = sexe;
            this.idRole = idRole;
            this.dateNaissance = dateNaissance;
            this.dateCreation = createdAt;
            this.dateMaj = updatedAt;
            this.abonnement = subscription;
        } else {
            this.idUser = user.id;
            this.prenom = user.prenom;
            this.nom = user.nom;
            this.sexe = user.sexe;
            this.idRole = user.idRole;
            this.dateNaissance = user.dateNaissance;
            this.dateCreation = user.dateCreation;
            this.dateMaj = user.dateMaj;
            this.abonnement = user.abonnement;
        }
    }

    get id(): number{
        return <number>this.idUser;
    }

    get firstname(): string{
        return <string>this.prenom;
    }

    get name(): string{
        return <string>this.nom;
    }

    get genre(): string{
        return <string>this.sexe;
    }

    get role(): string{
        return new Role(<number>this.idRole).name;
    }

    get birthdate(): string{
        return <string>this.dateNaissance;
    }

    get creationAt(): string{
        return <string>this.dateCreation;
    }

    get updatedAt(): string{
        return <string>this.dateMaj;
    }

    get subscription(): boolean{
        return <boolean>this.abonnement;
    }

    get attributInsert(): Array <string> {
        return ['firstname', 'lastname', 'sexe', 'idRole', 'dateNaissance', 'createdAt', 'updatedAt', 'subscription']
    }
}