export type listeTables = "user" | "account" | "role";

interface attributSelectInterface {
    primaryKey: string;
    attribut: Array<string>;
}

/**
 *
 * List of the property retrieved for the Select method
 * @readonly
 * @type {Array < string >}
 */
 const listAttributSelect: Record<listeTables, attributSelectInterface> = {
    "user": {
        primaryKey: `idUser`,
        attribut: [`idUser`, `firstname`, `lastname`, `gender`, `idRole`, `birthdate`, `createdAt`, `updatedAt`, `subscription`]
    },
    "account": {
        primaryKey: `idUser`,
        attribut: [`email`, `password`, `idUser`]
    },
    "role": {
        primaryKey: `idRole`,
        attribut: [`idRole`, `name`]
    },
};

export default listAttributSelect;