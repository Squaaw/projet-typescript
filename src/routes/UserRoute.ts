import { Router } from 'express';
import { UserController } from '../controller/UserController';
import { updateMidd, signOutMidd } from '../middlewares/user.middleware';

const route: Router = Router();

route.put('/', updateMidd, UserController.update);
route.delete('/off', signOutMidd, UserController.signOut);

export { route as UserRoute }