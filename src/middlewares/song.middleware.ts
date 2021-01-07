import { Request, Response } from 'express';
import { verify } from "jsonwebtoken";
import TokenException from "../exception/TokenException";
import Song from '../models/Song';
import User from '../models/User';

export const getSongsMidd = async(req: Request, res: Response, next: () => void) => {

    let token: any = req.headers.authorization;

    try{
        const isTokenValid = await TokenException.isTokenValid(token);

        if (!isTokenValid)
            throw new Error('401');

        token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
        const userId = token.id;
        const user: any = await User.select({ idUser: userId});

        // If current user does not have any subscription, throw error
        if (user[0].subscription == 0)
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
        const user: any = await User.select({ idUser: userId});

        // If current user does not have any subscription, throw error
        if (user[0].subscription == 0)
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