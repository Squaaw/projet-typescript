import DateException from "../exception/DateException";
import TokenException from "../exception/TokenException";
import { Request, Response } from 'express';

export const updateMidd = async(req: Request, res: Response, next: () => void) => {

    let data: any = req.body;
    const dateNaiss = data.date_naissance;
    const optionalFields = ['firstname', 'lastname', 'date_naissance', 'sexe']

    try
    {
        let update: boolean = false;

        // if one of the optional fields value is empty, throw error 409 (to prevent updating empty fields)
        for (const field in data){
            for (const optional in optionalFields){
                if (field === optionalFields[optional]){  
                    update = true;                       
                    if (!data[field]) throw new Error('409');
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

        const isTokenValid = await TokenException.isTokenValid(req.headers.authorization);

        if (isTokenValid)
            return next();
        else
            throw new Error('401');
    }
    catch (err){
        if (err.message == '409')
            return res.status(409).json({error: true, message: "Une ou plusieurs données sont erronées"}).end();
        else
            return res.status(401).json({error: true, message: "Votre token n'est pas correct"}).end();
    }
}

export const signOutMidd = async(req: Request, res: Response, next: () => void) => {   
    try{
        const isTokenValid = await TokenException.isTokenValid(req.headers.authorization);

        if (isTokenValid)
            return next();
        else
            throw new Error();
    }
    catch (err){
        return res.status(401).json({error: true, message: "Votre token n'est pas correct"}).end();
    }
}