import Account from "../models/Account";
import User from "../models/User";
import PasswordException from '../exception/PasswordException';
import { decode, sign } from 'jsonwebtoken';
import { Request, Response } from 'express';
import Role from "../models/Role";

export class AuthController {
    static register = async(req: Request, res: Response) => {
        
        let data: any = req.body;

        try{
            if (await Account.isExiste(data.email))
                throw new Error('409');

            let today = new Date();
            let dd = String(today.getDate()).padStart(2, '0');
            let mm = String(today.getMonth() + 1).padStart(2, '0');
            let yyyy = today.getFullYear();
            let currentDate = yyyy + '-' + mm + '-' + dd;

            const user = new User(null, data.firstname, data.lastname, data.sexe, 1, data.date_naissance, currentDate, currentDate, 0);
            await user.save();
            const password = await PasswordException.hashPassword(data.password);
            const account = new Account(user, data.email, password);
            await account.save();

            const theToken: any = await sign({ id: user.id, name: user.lastname }, <string>process.env.JWT_KEY, {expiresIn: '5m'})

            const token = {
                token: theToken,
                expired: await (<any> decode(theToken)).exp
            }

            const role: any = await Role.select({ idRole: user.idRole});

            return res.status(201).json({
                error: false,
                message: "L'utilisateur a bien été créé avec succès",
                user: {
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: account.email,
                    sexe: user.gender,
                    role: role[0].name,
                    dateNaissance: user.birthdate,
                    createdAt: user.creationDate,
                    updatedAt: user.updatedDate,
                    subscription: user.subscription
                }
            });

        } catch (err){
            if (err.message == '409'){
                return res.status(409).json({error: true, message: "Un compte utilisant cette adresse mail est déjà enregistré"}).end();
            }
        }
    }
}