import DateException from "../exception/DateException";
import TokenException from "../exception/TokenException";
import { Request, Response } from 'express';
import EmailException from "../exception/EmailException";
import PasswordException from "../exception/PasswordException";
import Account from "../models/Account";
import { verify } from 'jsonwebtoken';
import User from "../models/User";
import Child from "../models/Child";

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

export const addChildMidd = async(req: Request, res: Response, next: () => void) => {

    let data: any = req.body;
    let token: any = req.headers.authorization;
    const requiredFields = ['firstname', 'lastname', 'sexe', 'date_naissance', 'email', 'password'];

    try{
        // Token is required in order to know wether access is granted or not (if no token was found, throw error)
        const isTokenValid = await TokenException.isTokenValid(token);

        if (!isTokenValid)
            throw new Error('403');

        token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
        const userId = token.id;
        const user: any = await User.select({ idUser: userId});

        // If role is neither tutor nor administrator, throw error (creating a child account is forbidden for children)
        if (user[0].idRole == 2)
            throw new Error('403');

        let error: boolean = true;

        for (const required in requiredFields){
            error = true;

            for (const field in data){
                if(field === requiredFields[required])
                    error = false;
            }

            // Check if all required fields are set
            if (error)
                throw new Error('400');
        }

        // Check if data are correct
        if (!EmailException.checkEmail(data.email))
            throw new Error('nonConforme');
    
        if (!PasswordException.isValidPassword(data.password))
            throw new Error('nonConforme');

        if (!DateException.checkDate(data.date_naissance))
            throw new Error('nonConforme');

        const isEmailInUse = await Account.isExiste(data.email);
        
        // Check if email is already in use
        if (isEmailInUse)
            throw new Error('emailInUse');

        // Check if the tutor has registered less than 3 children. Max 3 children per tutor account.
        const childCount: any = await Child.select({ tutor_id: userId});
        if (childCount.length == 3)
            throw new Error('quotaReached');

        next();

    } catch(err) {
        if (err.message == '400'){
            return res.status(400).json({error: true, message: "Une ou plusieurs données obligatoire sont manquantes"}).end();
        }

        if (err.message == 'nonConforme'){
            return res.status(409).json({error: true, message: "Une ou plusieurs données sont erronées"}).end();
        }

        if (err.message == 'emailInUse'){
            return res.status(409).json({error: true, message: "Un compte utilisant cette adresse mail est déjà enregistré"}).end();
        }

        if (err.message == 'quotaReached'){
            return res.status(409).json({error: true, message: "Vous avez dépassé le cota de trois enfants"}).end();
        }

        // Default error is 403 if none of the above error was catched (token not found or jwt expired or wrong signature)
        return res.status(403).json({error: true, message: "Vos droits d'accès ne permettent pas d'accéder à la ressource"}).end();
    }
}

export const removeChildMidd = async(req: Request, res: Response, next: () => void) => {
    let data: any = req.body;
    let token: any = req.headers.authorization;

    try{
        // Check if current token is valid
        const isTokenValid = await TokenException.isTokenValid(token);

        if (!isTokenValid)
            throw new Error('401');

        token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
        const userId = token.id;
        const user: any = await User.select({ idUser: userId});

        // If role is neither tutor nor administrator, throw error (removing a child account is forbidden for children)
        if (user[0].idRole == 2)
            throw new Error('forbidden');
            
        const childId = data.id_child;

        // If id_child field is empty, throw error
        if (!childId)
            throw new Error('wrongId');
        
        // If child does not exist in database, throw error
        const child: any = await Child.select({ child_id: childId});
        if (child.length == 0)
            throw new Error('wrongId');
        
        next();

    } catch (err){
        if (err.message == 'forbidden'){
            return res.status(403).json({error: true, message: "Vos droits d'accès ne permettent pas d'accéder à la ressource"}).end();
        }

        if (err.message == 'wrongId'){
            return res.status(403).json({error: true, message: "Vous ne pouvez pas supprimer cet enfant"}).end();
        }

        // Default error is 401 if none of the above error was catched
        return res.status(401).json({error: true, message: "Votre token n'est pas correct"}).end();
    }
}

export const getChildMidd = async(req: Request, res: Response, next: () => void) => {

    let token: any = req.headers.authorization;

    try{
        const isTokenValid = await TokenException.isTokenValid(token);

        if (!isTokenValid)
            throw new Error('403');

        token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
        const userId = token.id;
        const user: any = await User.select({ idUser: userId});

        // If role is neither tutor nor administrator, throw error (getting all children account data is forbidden for children)
        if (user[0].idRole == 2)
            throw new Error('403');

        next();

    } catch (err) {
        return res.status(403).json({error: true, message: "Vos droits d'accès ne permettent pas d'accéder à la ressource"}).end();
    }
}

export const removeUserMidd = async(req: Request, res: Response, next: () => void) => {
    
    let token: any = req.headers.authorization;

    try{
        const isTokenValid = await TokenException.isTokenValid(token);

        if (!isTokenValid)
            throw new Error('401');

        next();

    } catch (err) {
        return res.status(401).json({error: true, message: "Votre token n'est pas correct"}).end();
    }
}

export const addCardMidd = async(req: Request, res: Response, next: () => void) => {

    let data: any = req.body;
    let token: any = req.headers.authorization;
    const requiredFields = ['cartNumber', 'month', 'year', 'default'];

    try{
        const isTokenValid = await TokenException.isTokenValid(token);

        if (!isTokenValid)
            throw new Error('401');

        token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
        const userId = token.id;
        const user: any = await User.select({ idUser: userId});

        // If role is neither tutor nor administrator, throw error (adding a credit card is forbidden for children)
        if (user[0].idRole == 2)
            throw new Error('403');

        let error: boolean = true;

        for (const required in requiredFields){
            error = true;

            for (const field in data){
                if(field === requiredFields[required])
                    error = false;
            }

            // Check if all required fields are set
            if (error)
                throw new Error('409');
        }

        // Default source is either false or true
        if (data.default !== 'true' && data.default !== 'false')
            throw new Error('409');

        next();

    } catch (err) {
        if (err.message == '403')
            return res.status(403).json({error: true, message: "Vos droits d'accès ne permettent pas d'accéder à la ressource"}).end();

        if (err.message == '409')
            return res.status(409).json({error: true, message: "Une ou plusieurs données sont erronées"}).end();

        return res.status(401).json({error: true, message: "Votre token n'est pas correct"}).end();
    }
}