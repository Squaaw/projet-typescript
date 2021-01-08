import Account from "../models/Account";
import User from "../models/User";
import { Request, Response } from 'express';
import DateException from "../exception/DateException";
import { verify } from 'jsonwebtoken';
import TokenException from "../exception/TokenException";
import Blacklist from "../models/Blacklist";
import PasswordException from "../exception/PasswordException";
import Child from "../models/Child";
import Role from "../models/Role";
import Stripe from "stripe";

export class UserController {

    static update = async(req: Request, res: Response) => {

        let data: any = req.body;
        let token: any = req.headers.authorization;
    
        try{
            if (token)
                token = verify(TokenException.split(token), <string>process.env.JWT_KEY);
    
            const userId = token.id;
            let updated = false;
    
            // Since data are optionals, it is necessary to check which values are received in order to prevent updating empty fields.
    
            if (data.firstname){
                User.update({ firstname: data.firstname}, { idUser: userId });
                updated = true;
            }
    
            if (data.lastname){
                User.update({ lastname: data.lastname}, { idUser: userId });
                updated = true;
            }
    
            if (data.date_naissance){
                User.update({ birthdate: data.date_naissance}, { idUser: userId });
                updated = true;
            }
    
            if (data.sexe){
                User.update({ gender: data.sexe}, { idUser: userId });
                updated = true;
            }
    
            // Set 'updatedAt' field with current date
            if (updated)
                User.update({ updatedAt: DateException.formatDate(new Date())}, {idUser: userId});
    
            return res.status(200).json({error: false, message: "Vos données ont été mises à jour"});
    
        } catch (err){
            console.log(err);
        }
    }

    static signOut = async(req: Request, res: Response) => {

        try{
            // Add current valid token to the blacklist in order not to use this token. User needs to log in again to get another token once disconnected.
            const token = TokenException.split(<string>req.headers.authorization);
            const blacklist = new Blacklist(null, token);
            await blacklist.save();

            return res.status(200).json({error: false, message: "L'utilisateur a été déconnecté avec succès"});
        }
        catch (err){
            console.log(err);
        }
    }

    static addChild = async(req: Request, res: Response) => {

        let data: any = req.body;
        let token: any = req.headers.authorization;

        try{
            const isTokenValid = await TokenException.isTokenValid(token);

            if (!isTokenValid)
                throw new Error('403');

            token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
            const tutorId = token.id;
            const tutor: any = await User.select({ idUser: tutorId});
            const subscription: number = tutor[0].subscription;

            // Set current date to yyyy-MM-dd format
            let today: Date = new Date();
            let currentDate = DateException.formatDate(today);

            // Insert the user data into the database
            const user = new User(null, data.firstname, data.lastname, data.sexe, 2, data.date_naissance, currentDate, currentDate, subscription);
            await user.save();
            const password = await PasswordException.hashPassword(data.password);
            const account = new Account(user, data.email, password, 0, today);
            await account.save();
            const child = new Child(user, tutorId);
            await child.save();

            // Get the role's name from the ID
            const role: any = await Role.select({ idRole: user.idRole});

            return res.status(201).json({
                error: false,
                message: "Votre enfant a bien été créé avec succès",
                user: {
                    firstname: user.prenom,
                    lastname: user.nom,
                    sexe: user.sexe,
                    role: role[0].name,
                    dateNaissance: user.dateNaiss,
                    createdAt: user.creationDate,
                    updateAt: user.updatedDate,
                    subscription: user.abonnement
                }
            });

        } catch (err){
            return res.status(403).json({error: true, message: "Vos droits d'accès ne permettent pas d'accéder à la ressource"}).end();
        }
    }

    static removeChild = async(req: Request, res: Response) => {

        let data: any = req.body;

        try{
            const isRemoved: boolean = await User.delete({ idUser: data.id_child});

            if (!isRemoved)
                throw new Error('403');

            return res.status(201).json({ error: false, message: "L'utilisateur a été supprimée avec succès" });

        } catch(err) {
            return res.status(403).json({error: true, message: "Vous ne pouvez pas supprimer cet enfant"}).end();
        }
    }

    static getChild = async(req: Request, res: Response) => { 

        let token: any = req.headers.authorization;

        try{
            token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
            const tutorId = token.id;
            const child: any = await Child.select({ tutor_id: tutorId });

            // This means there is no existing child account for the current tutor.
            if (child.length == 0)
                throw new Error('400');

            let i: number;
            let userData: Array<any> = [];

            for (i = 0; i < child.length; i++){
                const role: any = await Role.select({ idRole: child[i].idRole});
                const user: any = {
                    firstname: child[i].firstname,
                    lastname: child[i].lastname,
                    sexe: child[i].gender,
                    role: role[0].name,
                    dateNaissance: child[i].birthdate,
                    createdAt: child[i].createdAt,
                    updateAd: child[i].updatedAt,
                    subscription: child[i].subscription
                }
                userData.push(user);
            }

            return res.status(200).json({
                error: false,
                users: userData
            });

        } catch (err) {
            return res.status(400).json({error: true, message: "Une ou plusieurs données obligatoire sont manquantes"}).end();
        }
    }

    static removeUser = async(req: Request, res: Response) => {

        let token: any = req.headers.authorization;
        let i: number;

        try{
            token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
            const userId = token.id;

            // Check if the user is a tutor and has children linked to this account in order to delete the children accounts in the first place (even though foreign keys are ON CASCADE DELETE, it won't delete children accounts from user).
            const childCount: any = await Child.select({ tutor_id: userId});

            if (childCount.length > 0){
                for (i = 0; i < childCount.length; i++){
                    await User.delete({ idUser: childCount[i].child_id});
                }
            }

            // Delete the user account (tutor or child).
            await User.delete({ idUser: userId});

            // Add the curent token to the blacklist to prevent current user to use it again.
            token = TokenException.split(<string>req.headers.authorization);
            const blacklist = new Blacklist(null, token);
            await blacklist.save();

            return res.status(200).json({ error: false, message: "Votre compte a été supprimée avec succès" });

        } catch (err){
            console.log(err);
        }
    }

    static addCard = async(req: Request, res: Response) => {

        const data: any = req.body;
        const cardNumber: String = data.cartNumber;
        const month: number = data.month;
        const year: number = data.year;
        const isDefaultSource = data.default;

        let token: any = req.headers.authorization;

        try{
            token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
            const userId = token.id;
            const user: any = await Account.select({ idUser: userId});
            const stripe_customerId = user[0].stripe_customerId;
            const userName = user[0].firstname + ' ' + user[0].lastname;
            const userMail = user[0].email;

            // Stripe secret key
            const SECRET_KEY = <string>process.env.STRIPE_SECRET_KEY;   
            const stripe = require('stripe')(SECRET_KEY);

            // Create a custom token according to card data
            const cardToken = await stripe.tokens.create({
                card: {
                    number: cardNumber,
                    exp_month: month,
                    exp_year: year,
                    // cvc: '314'
                },
            });

            // Check if current user has already an existing stripe account (if he has already registered a card)
            if (stripe_customerId) {

                // Retrieve all the current user's registered cards.
                const cards: any = await stripe.customers.listSources(
                    stripe_customerId,
                    {object: 'card'}
                );
        
                // If the exact fingerprint value is found, it means the current card already exists. The fingerprint uniquely identifies this particular card number.
                for (let i = 0; i < cards.data.length; i++){
                    if (cards.data[i].fingerprint === cardToken.card.fingerprint){
                        throw new Error('409');
                    }
                }

                // Add the card to the existing stripe user account
                const newCard = await stripe.customers.createSource(
                    stripe_customerId,
                    {
                        source: cardToken.id
                    }
                );

                // Set as default card according to data.default field
                if (isDefaultSource === 'true'){
                    await stripe.customers.update(
                        stripe_customerId,
                        {
                          default_source: newCard.id
                        }
                    );
                }
            } else {
                // When this part of the code is reached, it means the user never registered any card. Then a stripe customer account will be created for this user.          
                const desc = 'User #' + userId + ': ' + userName;

                // Set params which contain the user info and the custom token created previously
                const params: Stripe.CustomerCreateParams = {
                    description: desc,
                    source: cardToken.id,
                    email: userMail
                };

                // Create a new stripe user
                const customer: Stripe.Customer = await stripe.customers.create(params);
                User.update({ stripe_customerId: customer.id}, {idUser: userId });
            }

            return res.status(200).json({ error: false, message: "Vos données ont été mises à jour" });

        } catch (err) {
             if (err.message == '409')
                return res.status(409).json({error: true, message: "La carte existe déjà"}).end();

                return res.status(402).json({error: true, message: "Informations bancaire incorrectes"}).end();
        }
    }
}

