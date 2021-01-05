import { verify } from "jsonwebtoken";
import Blacklist from "../models/Blacklist";

export default class TokenException extends Error{
    constructor(){
        super('Token is not valid!');
    }

    static split(token: string): string {
        return token.split('Bearer ').join('');
    }

    // Check if a token exists and is valid
    static async isTokenValid(headerAuthorization: any): Promise<boolean>{
        if (headerAuthorization && verify(TokenException.split(headerAuthorization), <string>process.env.JWT_KEY)){        
            // Check if the current token is blacklisted (if the user logged out before the token expiration time)          
            const isTokenBlacklisted = await Blacklist.isExiste(TokenException.split(headerAuthorization));
            console.log(isTokenBlacklisted);
            if (!isTokenBlacklisted) return true;
        }

        return false;
    }
}