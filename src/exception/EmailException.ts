export default class EmailException extends Error{
    constructor(){
        super('Email is not valid');
    }

    static checkEmail(email: string):boolean{
        const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return (reg.test(email.toLowerCase().trim()));
    }

    static sendMail(email: string, subject: string, message: string){
        var nodemailer = require('nodemailer');
        const service = <string>process.env.EMAIL_SERVICE;
        const user = <string>process.env.EMAIL_USER;
        const pass = <string>process.env.EMAIL_PASS;

        var transporter = nodemailer.createTransport({
            service: service,
            auth: {
                user: user,
                pass: pass
            }
            });

        var mailOptions = {
        from: 'zoubida@fastmail.com',
        to: email,
        subject: subject,
        text: message
        };

        transporter.sendMail(mailOptions, function(error: any, info: { response: string; }){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        
    }
}