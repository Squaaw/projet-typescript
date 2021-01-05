import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { registerMidd, loginMidd } from '../middlewares/auth.middleware';
import { Request, Response } from 'express';

const route: Router = Router();

route.get('/', (req: Request, res: Response) => {
    try{ return res.end('<h1>Welcome to Zoubify!</h1>'); }
    catch{ return res.end('<h1>404 not found!</h1>'); }
})

route.post('/register', registerMidd, AuthController.register);
route.post('/login', loginMidd, AuthController.login);

export { route as AuthentificationRoute }