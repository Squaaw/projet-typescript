import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { registerMidd, loginMidd } from '../middlewares/auth.middleware';
import { Request, Response } from 'express';

const route: Router = Router();

// Main route
route.get('/', (req: Request, res: Response) => {
    try{ return res.end('<h1>Welcome to Zoubify!</h1>'); }
    catch{ return res.end('<h1>404 not found!</h1>'); }
})

// Sign Up a new user
route.post('/register', registerMidd, AuthController.register);

// Sign In an existing user
route.post('/login', loginMidd, AuthController.login);

export { route as AuthentificationRoute }