export type listeTables = "user" | "account" | "role" | "blacklist" | "child" | "type" | "song" | "bill";

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
        attribut: [`idUser`, `firstname`, `lastname`, `gender`, `idRole`, `birthdate`, `createdAt`, `updatedAt`, `subscription`, `stripe_customerId`]
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
    "type": {
        primaryKey: `idType`,
        attribut: [`idType`, `name`]
    },
    "song": {
        primaryKey: `idSong`,
        attribut: [`idSong`, `name`, `cover`, `time`, `createdAt`, `updatedAt`, `idType`]
    },
    "bill": {
        primaryKey: `idBill`,
        attribut: [`idBill`, `id_Stripe`, `datePayment`, `montantHt`, `montantTtc`, `source`, `createdAt`, `updatedAt`, `idUser`, `captured`]
    }
};

export default listAttributSelect;