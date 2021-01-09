import Account from "../models/Account";
import User from "../models/User";
import PasswordException from '../exception/PasswordException';
import { decode, sign } from 'jsonwebtoken';
import { Request, Response } from 'express';
import Role from "../models/Role";
import DateException from "../exception/DateException";
import EmailException from "../exception/EmailException";
import Song from "../models/Song";

export class AuthController {
    static register = async(req: Request, res: Response) => {
        
        let data: any = req.body;

        try{
            // Check if email address is already in use
            if (await Account.isExiste(data.email))
                throw new Error('409');

            // Set current date to yyyy-MM-dd format
            let today: Date = new Date();
            let currentDate = DateException.formatDate(today);

            // Insert the user data into the database
            const user = new User(null, data.firstname, data.lastname, data.sexe, 1, data.date_naissance, currentDate, currentDate, 0);
            await user.save();
            const password = await PasswordException.hashPassword(data.password);
            const account = new Account(user, data.email, password, 0, today);
            await account.save();

            const songs: any = await Song.selectAll();
            const titre = (songs.length > 0) ? 'titres' : 'titre';
            let message = `Bienvenue, ${user.firstname}\n`;
            message += `Merci de faire partie de notre communauté ! Nous espérons que vous y trouverez votre bonheur parmi nos ${songs.length} ${titre} ;)`;
            
            // Sending confirmation mail
            EmailException.sendMail(account.email, "Confirmation d'inscription", message)

            // Get the role's name from the ID
            const role: any = await Role.select({ idRole: user.idRole});

            return res.status(201).json({
                error: false,
                message: "L'utilisateur a bien été créé avec succès",
                user: {
                    firstname: user.prenom,
                    lastname: user.nom,
                    email: account.email,
                    sexe: user.sexe,
                    role: role[0].name,
                    dateNaissance: user.dateNaiss,
                    createdAt: user.creationDate,
                    updateAt: user.updatedDate,
                    subscription: user.abonnement
                }
            });

        } catch (err){
            if (err.message == '409'){
                return res.status(409).json({error: true, message: "Un compte utilisant cette adresse mail est déjà enregistré"}).end();
            }
        }
    }

    static login = async(req: Request, res: Response) => {
        
        let data: any = req.body;

        try{
            // Check if email address is stored in the database
            const isExist = await Account.isExiste(data.Email);

            if (!isExist)
                throw new Error('400');

            const account: any = await Account.select({ email: data.Email });
            let nbTentatives: number = account[0].attempts;
            const userId: number = account[0].idUser;

            // Get the difference between the current datetime and the datetime stored in the database when the max attempts to log in was reached
            let today = new Date();
            let blockedAttemptsDate: Date = account[0].blockedAttemptsDate;
            let dif = Math.abs((today.getTime() - blockedAttemptsDate.getTime()) / 1000); // get the difference in seconds

            // After 5 connection attempts, wait 2 minutes in order to be able to log in again.
            if (nbTentatives == 5 && dif < 120){
                throw new Error('429');
            } else if (nbTentatives == 5 && dif >= 120) { 
                nbTentatives = 0;
                Account.update({ attempts: 0}, { idUser: userId });
            }

            // Check if the password stored in the database and the input password match
            const isOk = await PasswordException.comparePassword(data.Password, account[0].password);

            if (!isOk){
                // If passwords don't match, add 1 attempt.
                nbTentatives++;
                Account.update({ attempts: nbTentatives}, {idUser: userId});

                // After 5 connection attempts, set the current date and time when it occured. Also send an email in case of forgotten password.
                if (nbTentatives == 5){
                    Account.update({ blockedAttemptsDate: new Date()}, {idUser: userId});

                    const message = "Vous avez tenté de vous connecter à votre compte, mais en vain. Avez-vous oublié votre mot de passe ? Un délai d'attente de 2 minutes est nécessaire afin de pouvoir vous connecter à nouveau.";
                    
                    // Sending forgotten password mail
                    EmailException.sendMail(account[0].email, "Tentatives de connexion erronées", message)
                }

                throw new Error('400');
            }

            // At this step, all provided informations were correct, then reset the amount of attempts to 0.
            if (nbTentatives > 0)
                Account.update({ attempts: 0}, {idUser: userId});

            const theToken: any = await sign({ id: userId, firstname: account[0].firstname }, <string>process.env.JWT_KEY, {expiresIn: '5m'});

            const token = {
                token: theToken,
                expired: await (<any> decode(theToken)).exp
            }

            const role: any = await Role.select({ idRole: account[0].idRole});

            return res.status(200).json({
                error: false,
                message: "L'utilisateur a été authentifié succès",
                token: "Bearer " + token.token,
                user: {
                    firstname: account[0].firstname,
                    lastname: account[0].lastname,
                    email: account[0].email,
                    sexe: account[0].gender,
                    role: role[0].name,
                    dateNaissance: account[0].birthdate,
                    createdAt: account[0].createdAt,
                    updateAt: account[0].updatedAt,
                    subscription: account[0].subscription
                }
            });

        } catch (err){
            if (err.message == '400'){
                return res.status(400).json({error: true, message: "Un compte utilisant cette adresse mail est déjà enregistré"}).end();
            }

            if (err.message == '429'){
                const errStr = "Trop de tentative sur l'email " + data.Email + " (5 max) - Veuillez patienter (2min)";
                return res.status(429).json({error: true, message: errStr}).end();
            }
        }
    }
}