import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import TokenException from '../exception/TokenException';
import User from '../models/User';

export const billMidd = async(req: Request, res: Response, next: () => void) => {

    let token: any = req.headers.authorization;

    try{
        const isTokenValid = await TokenException.isTokenValid(token);

        if (!isTokenValid)
            throw new Error('403');

        token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
        const userId = token.id;
        const user: any = await User.select({ idUser: userId});

        // If role is neither tutor nor administrator, throw error (getting bills info is forbidden for children)
        if (user[0].idRole == 2)
            throw new Error('403');

        next();

    } catch (err) {
        return res.status(403).json({error: true, message: "Vos droits d'accès ne permettent pas d'accéder à la ressource"}).end();
    }
}