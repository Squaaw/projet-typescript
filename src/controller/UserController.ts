import Account from "../models/Account";
import User from "../models/User";
import { Request, Response } from 'express';
import DateException from "../exception/DateException";
import { verify } from 'jsonwebtoken';
import TokenException from "../exception/TokenException";
import Blacklist from "../models/Blacklist";
import PasswordException from "../exception/PasswordException";
import Child from "../models/Child";
import Role from "../models/Role";

export class UserController {

    static update = async(req: Request, res: Response) => {

        let data: any = req.body;
        let token: any = req.headers.authorization;
    
        try{
            if (token)
                token = verify(TokenException.split(token), <string>process.env.JWT_KEY);
    
            const userId = token.id;
            let updated = false;
    
            // Since data are optionals, it is necessary to check which values are received in order to prevent updating empty fields.
    
            if (data.firstname){
                User.update({ firstname: data.firstname}, { idUser: userId });
                updated = true;
            }
    
            if (data.lastname){
                User.update({ lastname: data.lastname}, { idUser: userId });
                updated = true;
            }
    
            if (data.date_naissance){
                User.update({ birthdate: data.date_naissance}, { idUser: userId });
                updated = true;
            }
    
            if (data.sexe){
                User.update({ gender: data.sexe}, { idUser: userId });
                updated = true;
            }
    
            // Set 'updatedAt' field with current date
            if (updated)
                User.update({ updatedAt: DateException.formatDate(new Date())}, {idUser: userId});
    
            return res.status(200).json({error: false, message: "Vos données ont été mises à jour"});
    
        } catch (err){
            console.log(err);
        }
    }

    static signOut = async(req: Request, res: Response) => {

        try{
            // Add current valid token to the blacklist in order not to use this token. User needs to log in again to get another token once disconnected.
            const token = TokenException.split(<string>req.headers.authorization);
            const blacklist = new Blacklist(null, token);
            await blacklist.save();

            return res.status(200).json({error: false, message: "L'utilisateur a été déconnecté avec succès"});
        }
        catch (err){
            console.log(err);
        }
    }

    static addChild = async(req: Request, res: Response) => {

        let data: any = req.body;
        let token: any = req.headers.authorization;

        try{
            const isTokenValid = await TokenException.isTokenValid(token);

            if (!isTokenValid)
                throw new Error('403');

            token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
            const tutorId = token.id;
            const tutor: any = await User.select({ idUser: tutorId});
            const subscription: number = tutor[0].subscription;

            // Set current date to yyyy-MM-dd format
            let today: Date = new Date();
            let currentDate = DateException.formatDate(today);

            // Insert the user data into the database
            const user = new User(null, data.firstname, data.lastname, data.sexe, 2, data.date_naissance, currentDate, currentDate, subscription);
            await user.save();
            const password = await PasswordException.hashPassword(data.password);
            const account = new Account(user, data.email, password, 0, today);
            await account.save();
            const child = new Child(user, tutorId);
            await child.save();

            // Get the role's name from the ID
            const role: any = await Role.select({ idRole: user.idRole});

            return res.status(201).json({
                error: false,
                message: "Votre enfant a bien été créé avec succès",
                user: {
                    firstname: user.prenom,
                    lastname: user.nom,
                    sexe: user.sexe,
                    role: role[0].name,
                    dateNaissance: user.dateNaiss,
                    createdAt: user.creationDate,
                    updateAt: user.updatedDate,
                    subscription: user.abonnement
                }
            });

        } catch (err){
            return res.status(403).json({error: true, message: "Vos droits d'accès ne permettent pas d'accéder à la ressource"}).end();
        }
    }
}

