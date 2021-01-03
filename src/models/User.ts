import Role from './Role';

export default class User{

    protected idUser ? : number | null;
    public prenom: string;
    public nom: string;
    public sexe: string;
    public idRole: number;
    public dateNaissance: string;
    public dateCreation: string;
    public dateMaj: string;
    public abonnement: number;

    protected table: string = 'user';

    constructor(user: User | null, firstname: string = '', lastname: string = '', sexe: string = '', idRole: number = 1, dateNaissance: string = '', dateCreation: string = '', dateMaj: string = '', subscription: number = 0){
        if (user === null){
            this.prenom = firstname;
            this.nom = lastname;
            this.sexe = sexe;
            this.idRole = idRole;
            this.dateNaissance = dateNaissance;
            this.dateCreation = dateCreation;
            this.dateMaj = dateMaj;
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

    get lastname(): string{
        return <string>this.nom;
    }

    get gender(): string{
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

    get subscription(): number{
        return <number>this.abonnement;
    }

    get attributInsert(): Array <string> {
        return ['firstname', 'lastname', 'sexe', 'idRole', 'dateNaissance', 'createdAt', 'updatedAt', 'subscription']
    }
}