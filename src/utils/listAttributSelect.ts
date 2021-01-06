export type listeTables = "user" | "account" | "role" | "blacklist" | "child";

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
        attribut: [`email`, `password`, `idUser`, `attempts`, `blockedAttemptsDate`]
    },
    "role": {
        primaryKey: `idRole`,
        attribut: [`idRole`, `name`]
    },
    "blacklist": {
        primaryKey: `idToken`,
        attribut: [`idToken`, `token`]
    },
    "child": {
        primaryKey: `child_id`,
        attribut: [`child_id`, `tutor_id`]
    },
};

export default listAttributSelect;