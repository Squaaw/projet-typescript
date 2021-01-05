import Account from "../models/Account";
import User from "../models/User";
import { Request, Response } from 'express';
import DateException from "../exception/DateException";
import { verify } from 'jsonwebtoken';
import TokenException from "../exception/TokenException";
import StringException from "../exception/StringException";

export class UserController {

    static user = async(req: Request, res: Response) => {

        let data: any = req.body;
        let token: any = req.headers.authorization;
    
        try{
            if (token)
                token = await verify(TokenException.split(token), <string>process.env.JWT_KEY);
    
            const userId = token.id;
            let updated = false;
    
            // Since data are optionals, it is necessary to check which values are received in order to prevent updating empty fields.
    
            if (!StringException.isNullOrEmpty(data.firstname)){
                User.update({ firstname: data.firstname}, { idUser: userId });
                updated = true;
            }
    
            if (!StringException.isNullOrEmpty(data.lastname)){
                User.update({ lastname: data.lastname}, { idUser: userId });
                updated = true;
            }
    
            if (!StringException.isNullOrEmpty(data.date_naissance)){
                User.update({ birthdate: data.date_naissance}, { idUser: userId });
                updated = true;
            }
    
            if (!StringException.isNullOrEmpty(data.sexe)){
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
}

