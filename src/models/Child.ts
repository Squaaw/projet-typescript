import User from "./User";
import MySQL, { jointureInterface } from "../db/MySQL";
import DateException from "../exception/DateException";

export default class Child extends User{
    child_id: number | null | undefined;
    tutor_id: number;

    protected table: string = "child";

    constructor(childId: User, tutorId: number = 0){
        super(childId);

        this.child_id = this.id;
        this.tutor_id = tutorId;
    }

    get attributInsert(): Array <string> {
        return ['child_id', 'tutor_id']
    }

    static select(where: any) {
        return new Promise((resolve, reject) => {
            const join: Array <jointureInterface> = [{
                type: 'LEFT',
                table: 'user',
                where: {
                    table: 'child',
                    foreignKey: 'child_id'
                }
            },{
                type: 'LEFT',
                table: 'account',
                where: {
                    table: 'child',
                    foreignKey: 'child_id'
                }
            }]

            MySQL.selectJoin('child', join, where).then((arrayChild: Array <any>) => {
                let newUser: User;
                let data: Array <User> = [];

                for (const user of arrayChild) {
                    user.birthdate = DateException.formatDate(user.birthdate);
                    user.createdAt = DateException.formatDate(user.createdAt);
                    user.updatedAt = DateException.formatDate(user.updatedAt);
                    user.id = user.idUser;
                    newUser = new User(user);
                    data.push(new Child(newUser, user.tutor_id));
                }
                
                console.log(data);
                resolve(data);
            })
            .catch((err: any) => {
                console.log(err);
                reject(false)
            });
        })
    }
}