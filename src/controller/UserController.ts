import Account from "../models/Account";
import User from "../models/User";
import { Request, Response } from 'express';
import DateException from "../exception/DateException";
import { verify } from 'jsonwebtoken';
import TokenException from "../exception/TokenException";
import Blacklist from "../models/Blacklist";

export class UserController {

    static update = async(req: Request, res: Response) => {

        let data: any = req.body;
        let token: any = req.headers.authorization;
    
        try{
            if (token)
                token = await verify(TokenException.split(token), <string>process.env.JWT_KEY);
    
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
}

