export default class TokenException extends Error{
    constructor(){
        super('Token is not valid!');
    }

    static split(token: string): string {
        return token.split('Bearer ').join('');
    }
}