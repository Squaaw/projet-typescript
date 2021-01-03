import User from "./User";
import EmailException from "../exception/EmailException";
import PasswordException from "../exception/PasswordException";

export default class Account extends User {
    email: string;
    password: string = '';
    user_idUser: number | null | undefined;

    protected table: string = 'account';

    constructor(id: User, email: string = '', password: string = ''){

        super(id); // lance le constructeur du parent (User)

        if (EmailException.checkEmail(email))
            throw new EmailException;

        if (!PasswordException.isValidPassword(password))
            throw new PasswordException();

        this.email = email;
        this.password = password;
        this.user_idUser = this.id;
    }

    get attributInsert(): Array <string> {
        return ['email', 'password', 'idUser']
    }
}