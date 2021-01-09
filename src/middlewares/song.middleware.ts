import { Request, Response } from 'express';
import { verify } from "jsonwebtoken";
import DateException from '../exception/DateException';
import EmailException from '../exception/EmailException';
import TokenException from "../exception/TokenException";
import Account from '../models/Account';
import Bill from '../models/Bill';
import Child from '../models/Child';
import Song from '../models/Song';
import User from '../models/User';

const isSubscriptionValid = async(userId: number): Promise<boolean> => {

    const account: any = await Account.select({ idUser: userId });
    if (account[0].subscription == 0)
        return false;

    let result = true;
    let child: any;
    let tutorId = userId;
    let userMail = account[0].email;

    // If the current user is a child, we have to retrieve his tutor's id.
    if (account[0].idRole == 2){
        child = await Child.select({ child_id: userId });
        tutorId = child[0].tutor_id;
        const tutorData: any = await Account.select({ idUser: tutorId });
        userMail = tutorData[0].email;
        child = await Child.select({ tutor_id: tutorId }); // Get the full list of tutor's children
    }

    const bill: any = await Bill.select({ idUser: tutorId });
    const today: any = new Date();
    let chargeId = "";
    let trialDays = 0;

    // Check if any charge has not been captured yet.
    for (let i = 0; i < bill.length; i++){
        if (bill[i].captured == 0){
            let startTrial: any = bill[i].createdAt;
            const diffTime = Math.abs(today - startTrial);
            trialDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            chargeId = bill[i].id_Stripe;
            break;
        }
    }

    // If end trial date has been reached (after 7 days), charge the user on the card used to purchase the subscription.
    if (trialDays >= 7)
        result = await capturePayment(chargeId, userMail, tutorId, child);
    
    return result;
}

const capturePayment = async(chargeId: string, userMail: string, tutorId: number, child: any): Promise<boolean> => {

    const SECRET_KEY = <string>process.env.STRIPE_SECRET_KEY;   
    const stripe = require('stripe')(SECRET_KEY);
    const charge = await stripe.charges.capture(chargeId);
    
    const today: any = new Date();

    // If capture was successful, update data and send confirmation mail.
    if (charge.status == "succeeded"){
        Bill.update({ captured: 1 }, { id_Stripe: chargeId });
        Bill.update({ updatedAt: today }, { id_Stripe: chargeId });
        EmailException.sendMail(userMail, "Fin de votre période d'essai Zoubify", "Bonjour, votre période d'essai est arrivée à échéance. Un montant de 14,99€ vous sera alors prélevé sur votre carte par défaut.");
        return true;
    }
    else{
        // If the service was not able to charge the user at the end of the trial, revoke the tutor's subscription and his children subscriptions as well.
        User.update({ subscription: 0 }, { idUser: tutorId });
        User.update({ updatedAt: DateException.formatDate(today) }, { idUser: tutorId });

        for (let i = 0; i < child.length; i++){
            User.update({ subscription: 0 }, { idUser: child[i].child_id });
            User.update({ updatedAt: DateException.formatDate(today) }, { idUser: child[i].child_id });
        }

        return false;
    }
}

export const getSongsMidd = async(req: Request, res: Response, next: () => void) => {

    let token: any = req.headers.authorization;

    try{
        const isTokenValid = await TokenException.isTokenValid(token);

        if (!isTokenValid)
            throw new Error('401');

        token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
        const userId = token.id;

        // If current user has any active subscription, check if it is a trial subscription.
        const isSubscribed = await isSubscriptionValid(userId);
        if (!isSubscribed)
            throw new Error('403');

        next();

    } catch (err) {
        if (err.message == '403'){
            return res.status(403).json({error: true, message: "Votre abonnement ne permet pas d'accéder à la ressource"}).end();
        }

        return res.status(401).json({error: true, message: "Votre token n'est pas correct"}).end();
    }
}

export const getSongByIdMidd = async(req: Request, res: Response, next: () => void) => {

    const songId: any = req.params.id
    let token: any = req.headers.authorization;

    try{
        const isTokenValid = await TokenException.isTokenValid(token);

        if (!isTokenValid)
            throw new Error('403');

        token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
        const userId = token.id;

        const isSubscribed = await isSubscriptionValid(userId);
        if (!isSubscribed)
            throw new Error('403');
        
        // If song does not exist in database, throw error
        const song: any = await Song.select({ idSong: songId});
        if (song.length == 0)
            throw new Error('409');

        next();

    } catch (err) {
        if (err.message == '409'){
            return res.status(409).json({error: true, message: "L'audio n'est pas accessibles"}).end();
        }

        return res.status(403).json({error: true, message: "Votre abonnement ne permet pas d'accéder à la ressource"}).end();
    }
}