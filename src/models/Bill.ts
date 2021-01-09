import Role from './Role';
import MySQL from '../db/MySQL';
import DateException from '../exception/DateException';

export default class Bill{

    protected idBill ?: number;
    public id_Stripe: string;
    public datePayment: string;
    public montantHt: number;
    public montantTtc: number;
    public source: string;
    public createdAt: string;
    public updatedAt: string;
    public idUser: number;
    public captured: number;

    protected table: string = 'bill';

    constructor(bill: Bill | null, id_Stripe: string = '', datePayment: string = '', montantHt: number = 0, montantTtc: number = 0, source: string = '', createdAt: string = '', updatedAt: string = '', idUser: number = 0, captured = 0){
        if (bill === null){
            this.id_Stripe = id_Stripe;
            this.datePayment = datePayment;
            this.montantHt = montantHt;
            this.montantTtc = montantTtc;
            this.source = source;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
            this.idUser = idUser;
            this.captured = captured;
        } else {
            this.idBill = bill.id;
            this.id_Stripe = bill.id_Stripe;
            this.datePayment = bill.datePayment;
            this.montantHt = bill.montantHt;
            this.montantTtc = bill.montantTtc;
            this.source = bill.source;
            this.createdAt = bill.createdAt;
            this.updatedAt = bill.updatedAt;
            this.idUser = bill.idUser;
            this.captured = bill.captured;
        }
    }

    get id(): number{
        return <number>this.idBill;
    }

    get stripeId(): string{
        return <string>this.id_Stripe;
    }

    get purchaseDate(): string{
        return <string>this.datePayment;
    }

    get ht(): number{
        return <number>this.montantHt;
    }

    get ttc(): number{
        return <number>this.montantTtc;
    }

    get sourcePayment(): string{
        return <string>this.source;
    }

    get creationDate(): string{
        return <string>this.createdAt;
    }

    get updatedDate(): string{
        return <string>this.updatedAt;
    }

    get userId(): number{
        return <number>this.idUser;
    }

    get isCaptured(): number{
        return <number>this.captured;
    }

    get attributInsert(): Array <string> {
        return ['id_Stripe', 'datePayment', 'montantHt', 'montantTtc', 'source', 'createdAt', 'updatedAt', 'idUser', 'captured']
    }

    save(): Promise <number>{
        return new Promise((resolve, reject) => {
            MySQL.insert(this.table, this).then((id: number) => {
                this.idBill = id;
                console.log(`Saved ${this.table}`);
                resolve(id);
            })
            .catch((err: any) => {
                console.log(err);
                reject(false);
            });
        })
    };

    static select(where: any) {
        return new Promise((resolve, reject) => {
            MySQL.select('bill', where).then((arrayBill: Array<any>) => {
                let data: Array<Bill> = [];
                for (const bill of arrayBill) {
                    bill.datePayment = DateException.formatDateTime(bill.datePayment);
                    bill.createdAt = DateException.formatDateTime(bill.createdAt);
                    bill.updatedAt = DateException.formatDateTime(bill.updatedAt);
                    bill.id = bill.idBill;
                    data.push(new Bill(bill));
                }

                console.log(data);
                resolve(data);
            })
            .catch((err: any) => {
                console.log(err);
                reject(false);
            });
        })
    }
}