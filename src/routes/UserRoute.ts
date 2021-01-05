import { Router } from 'express';
import { UserController } from '../controller/UserController';
import { userMidd } from '../middlewares/user.middleware';

const route: Router = Router();

route.put('/', userMidd, UserController.user);

export { route as UserRoute }