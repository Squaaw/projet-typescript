import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import TokenException from '../exception/TokenException';
import User from '../models/User';

export class SubscriptionController {
    static subscription = async(req: Request, res: Response) => {
        
        let token: any = req.headers.authorization;

        // Stripe secret key
        const SECRET_KEY = <string>process.env.STRIPE_SECRET_KEY;   
        const stripe = require('stripe')(SECRET_KEY);

        try{
            token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
            const userId = token.id;
            const user: any = await User.select({ idUser: userId});
            const customerId = user[0].stripe_customerId;

            console.log("Création du paiement . . .");

            // Check if the user has an active source and charge him. If no card was found, throw error 402 (StripeCardError: Cannot charge a customer that has no active card)
            const test = await stripe.charges.create({
                    amount: 1499,
                    currency: 'eur',
                    customer: customerId,
                    description: 'Abonnement Zoubify'
                });

            console.log("SUCCESS!!!!");

            //console.log(test);
            console.log(test.id);
            console.log(test.amount); // à diviser par 100 pour le prix TTC / diviser par 1.2 pour obtenir le prix HT
            console.log(test.status);
            console.log(test.created);
            //new Date()

            return res.status(200).json({error: false, message: "Votre abonnement a bien été mise à jour"});
            // return res.status(200).json({error: false, message: "Votre période d'essai viens d'être activé"});

        } catch (err){
            console.log(err);
                return res.status(402).json({error: true, message: "Echec du payement de l'offre"}).end();
        }
    }
}