export default class DateException extends Error{
    constructor(){
        super('Date format is not valid!');
    }

    static checkDate(date: string):boolean{
        const reg = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
        return (reg.test(date.toLowerCase().trim()));
    }
}