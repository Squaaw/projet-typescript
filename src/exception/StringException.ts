export default class StringException extends Error{
    constructor(){
        super('String is undefined or empty!');
    }

    static isNullOrEmpty(input: string): boolean {
        if (input === undefined || input.length == 0)
            return true;

        return false;
    }
}