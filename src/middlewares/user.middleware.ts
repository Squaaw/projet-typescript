import { verify } from "jsonwebtoken";
import DateException from "../exception/DateException";
import StringException from "../exception/StringException";
import TokenException from "../exception/TokenException";
import { Request, Response } from 'express';

export const updateMidd = (req: any, res: any, next: () => void) => {

    let data: any = req.body;
    const dateNaiss = data.date_naissance;
    const optionalFields = ['firstname', 'lastname', 'date_naissance', 'sexe']

    try
    {
        let update: boolean = false;

        // if one of the optional fields is undefined or length = 0, throw error 409 (to prevent updating empty fields)
        for (const field in data){
            for (const optional in optionalFields){
                if (field === optionalFields[optional]){  
                    update = true;                       
                    if (StringException.isNullOrEmpty(data[field])) throw new Error('409');
                }
            }
        }

        // if update is false, it means there is no need to update anything (none of the optional fields were filled).
        if (!update)
            throw new Error('409');

        if (dateNaiss !== undefined){
            if (!DateException.checkDate(dateNaiss))
                throw new Error('409');
        }

        // Check if there is a bearer token in the headers and then check if the token is valid or expired.
        if (req.headers.authorization && verify(TokenException.split(req.headers.authorization), <string>process.env.JWT_KEY))
            return next();
        else
            throw new Error('401');
    }
    catch (err){
        if (err.message == '401' || err.message == 'jwt expired'){
            return res.status(401).json({error: true, message: "Votre token n'est pas correct"}).end();
        }

        if (err.message == '409'){
            return res.status(409).json({error: true, message: "Une ou plusieurs données sont erronées"}).end();
        }
    }
}

export const signOutMidd = (req: Request, res: Response, next: () => void) => {   
    try{
        if (req.headers.authorization && verify(TokenException.split(req.headers.authorization), <string>process.env.JWT_KEY))
            return next();
        else
            throw new Error();
    }
    catch (err){
        return res.status(401).json({error: true, message: "Votre token n'est pas correct"}).end();
    }
}