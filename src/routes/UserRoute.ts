import { Router } from 'express';
import { UserController } from '../controller/UserController';
import { updateMidd, signOutMidd, addChildMidd, removeChildMidd } from '../middlewares/user.middleware';

const route: Router = Router();

route.put('/', updateMidd, UserController.update);
route.delete('/off', signOutMidd, UserController.signOut);
route.post('/child', addChildMidd, UserController.addChild);
route.delete('/child', removeChildMidd, UserController.removeChild);

export { route as UserRoute }