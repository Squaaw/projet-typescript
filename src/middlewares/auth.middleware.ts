import { verify } from 'jsonwebtoken';
import { Request, Response } from 'express';
import EmailException from "../exception/EmailException";
import PasswordException from "../exception/PasswordException";
import DateException from '../exception/DateException';
import Account from '../models/Account';

export const split = (token: string) => { return token.split('Bearer ').join('') }

export const isNullOrEmpty = (input: string) => {
    if (input === undefined || input.length == 0)
        return true;

    return false;
}

export const authMidd = (req: Request, res: Response, next: () => void) => {

    try{
        if (req.headers.authorization && verify(split(req.headers.authorization), <string>process.env.JWT_KEY))
            return next();
        else
            throw new Error(`Vous n'êtes pas abilité à accéder à ce contenu.`);
    } catch (err) {
        return res.end('<h1>404 not found!</h1>');
    }
}

export const registerMidd = (req: any, res: any, next: () => void) => {

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

export const loginMidd = (req: any, res: any, next: () => void) => {

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

export const userMidd = (req: any, res: any, next: () => void) => {

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
                    if (isNullOrEmpty(data[field])) throw new Error('409');
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
        if (req.headers.authorization && verify(split(req.headers.authorization), <string>process.env.JWT_KEY))
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