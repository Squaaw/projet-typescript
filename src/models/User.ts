import Role from './Role';
import MySQL from '../db/MySQL';
import DateException from '../exception/DateException';

export default class User{

    protected idUser ? : number | null;
    public firstname: string;
    public lastname: string;
    public gender: string;
    public idRole: number;
    public birthdate: string;
    public createdAt: string;
    public updatedAt: string;
    public subscription: number;
    stripe_customerId: string | null;

    protected table: string = 'user';

    constructor(user: User | null, firstname: string = '', lastname: string = '', gender: string = '', idRole: number = 1, birthdate: string = '', createdAt: string = '', updatedAt: string = '', subscription: number = 0, stripe_customerId = null){
        if (user === null){
            this.firstname = firstname;
            this.lastname = lastname;
            this.gender = gender;
            this.idRole = idRole;
            this.birthdate = birthdate;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
            this.subscription = subscription;
            this.stripe_customerId = stripe_customerId;
        } else {
            this.idUser = user.id;
            this.firstname = user.firstname;
            this.lastname = user.lastname;
            this.gender = user.gender;
            this.idRole = user.idRole;
            this.birthdate = user.birthdate;
            this.createdAt = user.createdAt;
            this.updatedAt = user.updatedAt;
            this.subscription = user.subscription;
            this.stripe_customerId = user.stripe_customerId;
        }
    }

    get id(): number{
        return <number>this.idUser;
    }

    get prenom(): string{
        return <string>this.firstname;
    }

    get nom(): string{
        return <string>this.lastname;
    }

    get sexe(): string{
        return <string>this.gender;
    }

    get role(): string{
        return new Role(<number>this.idRole).nom;
    }

    get dateNaiss(): string{
        return <string>this.birthdate;
    }

    get creationDate(): string{
        return <string>this.createdAt;
    }

    get updatedDate(): string{
        return <string>this.updatedAt;
    }

    get abonnement(): number{
        return <number>this.subscription;
    }

    get customerId(): string{
        return <string>this.stripe_customerId;
    }

    get attributInsert(): Array <string> {
        return ['firstname', 'lastname', 'gender', 'idRole', 'birthdate', 'createdAt', 'updatedAt', 'subscription', 'stripe_customerId']
    }

    save(): Promise <number> {
        return new Promise((resolve, reject) => {
            MySQL.insert(this.table, this).then((id: number) => {
                this.idUser = id;
                console.log(`Saved ${this.table}`);
                resolve(id);
            })
            .catch((err: any) => {
                console.log(err);
                reject(false);
            });
        })
    };

    static select(where: any) {
        return new Promise((resolve, reject) => {
            MySQL.select('user', where).then((arrayUser: Array<any>) => {
                let data: Array<User> = [];
                for (const user of arrayUser) {
                    user.birthdate = DateException.formatDate(user.birthdate);
                    user.createdAt = DateException.formatDate(user.createdAt);
                    user.updatedAt = DateException.formatDate(user.updatedAt);
                    user.id = user.idUser;
                    data.push(new User(user));
                }

                console.log(data);
                resolve(data);
            })
            .catch((err: any) => {
                console.log(err);
                reject(false);
            });
        })
    }

    static update(update: any, where: any) {
        return new Promise((resolve, reject) => {
            MySQL.update('user', update, where).then(() => {
                console.log("Updated successfully!");
                resolve(true);
            })
            .catch((err: any) => {
                console.log(err);
                reject(false);
            });
        });
    }

    static delete(where: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            MySQL.delete('user', where).then(() => {
                resolve(true);
            })
            .catch((err: any) => {
                console.log(err);
                reject(false);
            });
        })
    }
}