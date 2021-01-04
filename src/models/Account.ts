import User from "./User";
import EmailException from "../exception/EmailException";
import PasswordException from "../exception/PasswordException";
import MySQL, { jointureInterface } from "../db/MySQL";

export default class Account extends User {
    email: string;
    password: string = '';
    user_idUser: number | null | undefined;

    protected table: string = 'account';

    constructor(id: User, email: string = '', password: string = ''){

        super(id); // lance le constructeur du parent (User)

        this.email = email;
        this.password = password;
        this.user_idUser = this.id;
    }

    get attributInsert(): Array <string> {
        return ['email', 'password', 'idUser']
    }

    static isExiste(email: string) {
        return new Promise((resolve, reject) => {
            MySQL.select('account', {email: email}).then((arrayClient: Array <any> ) => {
                resolve((arrayClient.length > 0));
            })
            .catch((err: any) => {
                console.log(err);
                reject(false);
            });
        })
    }

    static select(where: any) {
        return new Promise((resolve, reject) => {
            const join: Array <jointureInterface> = [{
                type: 'LEFT',
                table: 'user',
                where: {
                    table: 'account',
                    foreignKey: 'idUser'
                }
            }, {
                type: 'LEFT',
                table: 'role',
                where: {
                    table: 'user',
                    foreignKey: 'idRole'
                }
            }]

            MySQL.selectJoin('account', join, where).then((arrayAccount: Array <any>) => {
                let newUser: User;
                let data: Array <User> = [];

                for (const user of arrayAccount) {
                    user.birthdate = new String(user.birthdate);
                    user.createdAt = new String(user.createdAt);
                    user.updatedAt = new String(user.updatedAt);
                    user.id = user.idUser;
                    newUser = new User(user);
                    data.push(new Account(newUser, user.email, user.password));
                }
                
                console.log(data);
                resolve(data);
            })
            .catch((err: any) => {
                console.log(err);
                reject(false)
            });
        })
    }
}