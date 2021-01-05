import { createConnection, Connection } from 'mysql';
import listAttributSelect, { listeTables } from '../utils/listAttributSelect';
import User from '../models/User';
import Account from '../models/Account';
import Role from '../models/Role';
import Blacklist from '../models/Blacklist';

export interface jointureInterface{
    type: 'LEFT'|'RIGHT'|'FULL'|'INNER';
    where: {
        table: listeTables;
        foreignKey: string;
    };
    table: listeTables;
}

export default class MySQL {

    static select(table: listeTables, where ?: any): any {
        return new Promise((resolve, reject) => {

            const bdd: Connection = createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_DATABASE,
                port: parseInt((process.env.PORTMYSQL === undefined) ? '3306' : process.env.PORTMYSQL)
            })

            bdd.connect(err => {
                if (err)
                    console.log('Connection database error');
            })

            let data = [];
            let columns = "";
            let conditionWhere = "";

            const key = listAttributSelect[table].attribut;

            for (const champs of key) {
                columns += "`" + champs + "`,";
            }

            for (const key in where) {
                conditionWhere += "`" + key + "` LIKE ? and ";
                data.push(where[key])
            }

            conditionWhere = conditionWhere.slice(0, -5);
            columns = columns.slice(0, -1);

            bdd.query(`SELECT ${columns} FROM ${table} WHERE ${conditionWhere} ;`, [data], (error, results, fields) => {
                if (error){
                    reject(error);
                    console.log(error);                   
                }
                else
                    resolve(results);

                bdd.end();
            });
        })
    }

    static update(table: listeTables, update: any, where: any): any {
        return new Promise((resolve, reject) => {

            const bdd: Connection = createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_DATABASE,
                port: parseInt((process.env.PORTMYSQL === undefined) ? '3306' : process.env.PORTMYSQL)
            })

            bdd.connect(err => {
                if (err)
                    console.log('Connection database error');
            })

            let dataWhere = [];
            let dataUpdate = [];
            let conditionWhere = "";
            let conditionUpdate = "";

            for (const key in update) {
                conditionUpdate += "`" + key + "` = ?, ";
                dataUpdate.push(update[key]);
            }

            for (const key in where) {
                conditionWhere += "`" + key + "` LIKE ? and ";
                dataWhere.push(where[key])
            }

            conditionUpdate = conditionUpdate.slice(0, -2);
            conditionWhere = conditionWhere.slice(0, -5);

            // console.log(`UPDATE ${table} SET ${conditionUpdate} WHERE ${conditionWhere} ;`);
            // console.log(dataUpdate);
            // console.log(dataWhere);

            // Known issue: when there are more than two parameters wether in the conditionUpdate or the conditionWhere, the SQL syntax is wrong! Temporary fix: call the method with only one parameter at a time...
            bdd.query(`UPDATE ${table} SET ${conditionUpdate} WHERE ${conditionWhere} ;`, [dataUpdate, dataWhere], (error, results, fields) => {
                if (error){
                    reject(error);
                    console.log(error);                   
                }
                else
                    resolve(results);

                bdd.end();
            });
        })
    }

    static selectJoin(table: listeTables, join: Array<jointureInterface> , where ?: any): any {
        return new Promise((resolve, reject) => {

            const bdd: Connection = createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_DATABASE,
                port: parseInt((process.env.PORTMYSQL === undefined) ? '3306' : process.env.PORTMYSQL)
            })

            bdd.connect(err => {
                if (err) console.log('Connection database error');
            })

            let data = [];
            let columns = "";
            let conditionJoin = "";
            let conditionWhere = "";

            const key = listAttributSelect[table].attribut;

            for (const champs of key) {
                columns += "`" + table + "`.`" + champs + "`,";
            }

            for (let i=0; i < join.length; i++) {
                let nameTable = join[i].table;
                conditionJoin += `${join[i].type} JOIN ${join[i].table} ON ${join[i].where.table}.${join[i].where.foreignKey} = ${join[i].table}.${listAttributSelect[nameTable].primaryKey} `;
                
                for (const champs of listAttributSelect[nameTable].attribut) {
                    columns += "`" + nameTable + "`.`" + champs + "`,";
                }
            }

            for (const key in where) {
                conditionWhere += "`" + table + "`.`" + key + "` LIKE ? and ";
                data.push(where[key]);
            }

            conditionWhere = conditionWhere.slice(0, -5);
            columns = columns.slice(0, -1);

            bdd.query(`SELECT ${columns} FROM ${table} ${conditionJoin} WHERE ${conditionWhere} ;`, [data], (error, results, fields) => {
                if (error) {
                    reject(error);
                    console.log(error);
                } else
                    resolve(results);

                bdd.end();
            });
        })
    }

    static insert(table: string, instance: User | Account | Blacklist): Promise<number> {
        return new Promise((resolve, reject) => {
        // return Promise because of the processing time of the database
        // The only way to get a return is using wether "resolve()" or "reject()"

            // Init params to database
            const bdd: Connection = createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_DATABASE,
                port: parseInt((process.env.PORTMYSQL === undefined) ? '3306' : process.env.PORTMYSQL) // 3306 mysql default port
            })

            // Open database connection
            bdd.connect(err => {
                if (err)
                    console.log('Connection database error');
            })
            
            let data = []; // Stores values
            let columns = ""; // Column names equals to attributes
            let parameters = ""; // Amount of parameters for the insert query
    
            for (const [key, value] of Object.entries(instance)) { // Convert the properties of our objects to an array
                if (instance.attributInsert.indexOf(key) !== -1) { // Check to property to the key array because the children Object will access property parent
                    columns += "`" + key + "`,";
                    parameters += "?,";
                    data.push(value);
                }
            }
    
            // Delete the last char (here, deletes the last coma ',')
            columns = columns.slice(0, -1);
            parameters = parameters.slice(0, -1);
    
            // Run SQL Query
            bdd.query(`INSERT INTO ${table} (${columns}) VALUES (${parameters})`, data, (error, results, fields) => {
                if (error){
                    console.log(error);
                    reject(error); // Catch error => Response promise false
                }                 
                else
                    resolve(results.insertId); // Then or await => Response promise true

                bdd.end(); // Close connection
            });
        })     
    }

}