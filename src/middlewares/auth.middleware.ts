import { Request, Response } from 'express';
import EmailException from "../exception/EmailException";
import PasswordException from "../exception/PasswordException";
import DateException from '../exception/DateException';

export const registerMidd = (req: Request, res: Response, next: () => void) => {

    let data: any = req.body;
    const requiredFields = ['firstname', 'lastname', 'sexe', 'date_naissance', 'email', 'password'];

    try{
        let error: boolean = true;

        for (const required in requiredFields){
            error = true;

            for (const field in data){
                if(field === requiredFields[required])
                    error = false;
            }

            if (error)
                throw new Error('400');
        }

        if (!EmailException.checkEmail(data.email))
            throw new Error('409');
    
        if (!PasswordException.isValidPassword(data.password))
            throw new Error('409');

        if (!DateException.checkDate(data.date_naissance))
            throw new Error('409');

        next();

    } catch(err) {
        if (err.message == '400'){
            return res.status(400).json({error: true, message: "Une ou plusieurs données obligatoire sont manquantes"}).end();
        }

        if (err.message == '409'){
            return res.status(409).json({error: true, message: "Une ou plusieurs données sont erronées"}).end();
        }
    }
}

export const loginMidd = (req: Request, res: Response, next: () => void) => {

    let data: any = req.body;
    const requiredFields = ['Email', 'Password'];

    try{
        let error: boolean = true;

        for (const required in requiredFields){
            error = true;

            for (const field in data){
                if(field === requiredFields[required])
                    error = false;
            }

            if (error)
                throw new Error('400');
        }

        next();

    } catch(err) {
        if (err.message == '400'){
            return res.status(400).json({error: true, message: "Email/password manquants"}).end();
        }
    }
}