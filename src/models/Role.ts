import MySQL from '../db/MySQL';

export default class Role {
    private idRole: number;
    private name: string | null;

    constructor(id: number, name?:string){
        this.idRole = id;
        this.name = (name === undefined) ? '' : name;
    }

    get id(): number{
        return this.idRole;
    }

    get nom(): string {
        return (this.name === null) ? '' : this.name;
    }

    static select(where: any) {
        return new Promise((resolve, reject) => {
            MySQL.select('role', where).then((arrayRole: Array<any>) => {
                let data: Array<Role> = [];
                for (const role of arrayRole) {
                    data.push(new Role(role.idRole, role.name));
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