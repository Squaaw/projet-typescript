import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import DateException from '../exception/DateException';
import TokenException from '../exception/TokenException';
import Bill from '../models/Bill';
import Child from '../models/Child';
import User from '../models/User';

export class SubscriptionController {
    static subscription = async(req: Request, res: Response) => {
        
        let token: any = req.headers.authorization;
        
        // Data required to charge customer and create a new bill.
        let chargeId = "";
        const amount = 1499;
        const montantTtc = amount / 100;
        const montantHt = montantTtc / 1.2;

        let successMessage = "Votre abonnement a bien été mise à jour";
        let capturePayment: boolean = true;
        let captureField: number = 1;

        // Stripe secret key
        const SECRET_KEY = <string>process.env.STRIPE_SECRET_KEY;   
        const stripe = require('stripe')(SECRET_KEY);

        try{
            token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
            const userId = token.id;
            const user: any = await User.select({ idUser: userId});
            const bills: any = await Bill.select({ idUser: userId });
            const customerId = user[0].stripe_customerId;
            
            // If no bill was found, it means the user never subscribed before. Then, activate trial account.
            if (bills.length == 0){
                capturePayment = false; // Instead of charging the customer immediately, just capture the payment and wait 7 days before sending an email and charging the card.
                captureField = 0; // Table bill field
                successMessage = "Votre période d'essai viens d'être activé";
            }

            const charge = await stripe.charges.create({
                amount: amount,
                currency: 'eur',
                customer: customerId,
                description: 'Abonnement Zoubify',
                capture: capturePayment
            });

            if (charge.status == "succeeded")
                chargeId = charge.id;

            const currentDate = DateException.formatDateTime(new Date());
            
            const bill = new Bill(null, chargeId, currentDate, montantHt, montantTtc, 'Stripe', currentDate, currentDate, userId, captureField);
            await bill.save();

            // Update tutor's and children subscription
            User.update({ subscription: 1}, { idUser: userId });
            User.update({ updatedAt: currentDate }, { idUser: userId });
            const children: any = await Child.select({ tutor_id: userId });

            for (let i = 0; i < children.length; i++){
                User.update({ subscription: 1}, { idUser: children[i].child_id });
                User.update({ updatedAt: currentDate }, { idUser: children[i].child_id });
            }

            return res.status(200).json({error: false, message: successMessage });

        } catch (err){

            if (!chargeId){
                // In case of database error or any error and a charge was succeeded, refund the user.
                await stripe.refunds.create({
                    charge: chargeId
                  });
            }

            // While trying to charge the user, check if any source is active. If no card was found, can't charge the customer that has no active card.
            return res.status(402).json({error: true, message: "Echec du payement de l'offre"}).end();
        }
    }
}