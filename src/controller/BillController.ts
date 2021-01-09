import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import TokenException from '../exception/TokenException';
import Bill from '../models/Bill';

export class BillController {

    static bill = async(req: Request, res: Response) => { 

        let billsData: Array<any> = [];
        let token: any = req.headers.authorization;

        try{
            token = verify(TokenException.split(token), <string>process.env.JWT_KEY);   
            const userId = token.id;
            const bills: any = await Bill.select({ idUser: userId });
            
            for (let i = 0; i < bills.length; i++){
                const bill: any = {
                    id: bills[i].idBill,
                    id_Stripe: bills[i].id_Stripe,
                    date_payment: bills[i].datePayment,
                    montant_ht: bills[i].montantHt,
                    montant_ttc: bills[i].montantTtc,
                    source: bills[i].source,
                    createdAt: bills[i].createdAt,
                    updatedAt: bills[i].updatedAt
                }
                billsData.push(bill);
            }

            return res.status(200).json({
                error: false,
                bill: billsData
            });

        } catch (err) {
            console.log(err);
        }
    }

}