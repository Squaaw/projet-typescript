import MySQL from "../db/MySQL";

export default class Type {
    private idType: number;
    private name: string | null;

    constructor(id: number, name?:string){
        this.idType = id;
        this.name = (name === undefined) ? '' : name;
    }

    get id(): number{
        return this.idType;
    }

    get nom(): string {
        return (this.name === null) ? '' : this.name;
    }

    static select(where: any) {
        return new Promise((resolve, reject) => {
            MySQL.select('type', where).then((arrayType: Array<any>) => {
                let data: Array<Type> = [];
                for (const type of arrayType) {
                    data.push(new Type(type.idType, type.name));
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