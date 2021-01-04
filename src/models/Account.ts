import User from "./User";
import EmailException from "../exception/EmailException";
import PasswordException from "../exception/PasswordException";
import MySQL, { jointureInterface } from "../db/MySQL";
import DateException from "../exception/DateException";

export default class Account extends User {
    email: string;
    password: string = '';
    user_idUser: number | null | undefined;
    attempts: number;
    blockedAttemptsDate: Date;

    protected table: string = 'account';

    constructor(id: User, email: string = '', password: string = '', attempts: number = 0, blockedAttemptsDate: Date){

        super(id); // lance le constructeur du parent (User)

        this.email = email;
        this.password = password;
        this.user_idUser = this.id;
        this.attempts = attempts;
        this.blockedAttemptsDate = blockedAttemptsDate;
    }

    get attributInsert(): Array <string> {
        return ['email', 'password', 'idUser', 'attempts', 'blockedAttemptsDate']
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
                    user.birthdate = DateException.formatDate(user.birthdate);
                    user.createdAt = DateException.formatDate(user.createdAt);
                    user.updatedAt = DateException.formatDate(user.updatedAt);
                    user.id = user.idUser;
                    newUser = new User(user);
                    data.push(new Account(newUser, user.email, user.password, user.attempts, user.blockedAttemptsDate));
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

    static update(update: any, where: any) {
        return new Promise((resolve, reject) => {
            MySQL.update('account', update, where).then(() => {
                console.log("Updated successfully!");
                resolve(true);
            })
            .catch((err: any) => {
                console.log(err);
                reject(false);
            });
        });
    }
}