import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import TokenException from '../exception/TokenException';
import User from '../models/User';

export const subscriptionMidd = async(req: Request, res: Response, next: () => void) => {

    let token: any = req.headers.authorization;

    try{
        const isTokenValid = await TokenException.isTokenValid(token);

        if (!isTokenValid)
            throw new Error('401');

        token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
        const userId = token.id;
        const user: any = await User.select({ idUser: userId});

        // If role is neither tutor nor administrator, throw error (getting any subscription is forbidden for children, only tutor can buy)
        if (user[0].idRole == 2)
            throw new Error('forbidden');

        // If no stripe customer Id was found, it means the user has still not registered any cards on his account via Stripe (route /user/cart)
        if (!user[0].stripe_customerId)
            throw new Error('wrongCard');

        next();

    } catch(err) {
        if (err.message == 'forbidden')
            return res.status(403).json({error: true, message: "Vos droits d'accès ne permettent pas d'accéder à la ressource"}).end();

        if (err.message == 'wrongCard')
            return res.status(403).json({error: true, message: "Veuillez compléter votre profil avec une carte de crédit"}).end();

        // 409 error is not needed here since no specific data are required. User id is part of the JWT and the user then can be tracked. No need to send card data since it MUST be stored with Stripe.
        // if (err.message == '409')
        //     return res.status(409).json({error: true, message: "L'offre n'est pas accessible"}).end();

        return res.status(401).json({error: true, message: "Votre token n'est pas correct"}).end();
    }
}