import MySQL from "../db/MySQL";

export default class Blacklist {
    idToken ?: number | null;
    token: string;

    protected table: string = 'blacklist';

    constructor(blacklist: Blacklist | null, token: string){
        if (blacklist === null){
            this.token = token;
        } else{
            this.idToken = blacklist.id;
            this.token = blacklist.tokenValue;
        }
    }

    get attributInsert(): Array <string> {
        return ['idToken', 'token']
    }

    get id(): number{
        return <number>this.idToken;
    }

    get tokenValue(): string{
        return <string>this.token;
    }

    static isExiste(token: string) {
        return new Promise((resolve, reject) => {
            MySQL.select('blacklist', {token: token}).then((arrayBlacklist: Array <any> ) => {
                resolve((arrayBlacklist.length > 0));
            })
            .catch((err: any) => {
                console.log(err);
                reject(false);
            });
        })
    }

    save(): Promise <number> {
        return new Promise((resolve, reject) => {
            MySQL.insert(this.table, this).then((id: number) => {
                this.idToken = id;
                console.log(`Saved ${this.table}`);
                resolve(id);
            })
            .catch((err: any) => {
                console.log(err);
                reject(false);
            });
        })
    };
}