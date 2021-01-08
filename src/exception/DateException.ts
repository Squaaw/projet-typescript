export default class DateException extends Error{
    constructor(){
        super('Date format is not valid!');
    }

    static checkDate(date: string):boolean{
        const reg = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
        return (reg.test(date.toLowerCase().trim()));
    }

    // Set current date to yyyy-MM-dd format
    public static formatDate(date: Date): string{
        let dd = String(date.getDate()).padStart(2, '0');
        let mm = String(date.getMonth() + 1).padStart(2, '0');
        let yyyy = date.getFullYear();
        let currentDate = yyyy + '-' + mm + '-' + dd;

        return currentDate;
    }

    public static formatDateTime(date: Date): string{
        const formatedDate = this.formatDate(date);
        let hours = String(date.getHours());
        let minutes = String(date.getMinutes());
        let seconds = String(date.getSeconds());

        const hh = (hours.toString().length == 1) ? '0' + hours : hours;
        const mm = (minutes.toString().length == 1) ? '0' + minutes : minutes;
        const ss = (seconds.toString().length == 1) ? '0' + seconds : seconds;

        const time = hh + ':' + mm + ':' + ss;

        return formatedDate + ' ' + time;
    }
}