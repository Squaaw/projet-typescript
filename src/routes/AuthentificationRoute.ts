import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { registerMidd, loginMidd } from '../middlewares/auth.middleware';
import { Request, Response } from 'express';

const route: Router = Router();
const path = require('path');

// Main route
route.get('/', (req: Request, res: Response) => {
    const indexPath = path.resolve("./index.html");
    res.sendFile(indexPath);
})

// Sign Up a new user
route.post('/register', registerMidd, AuthController.register);

// Sign In an existing user
route.post('/login', loginMidd, AuthController.login);

export { route as AuthentificationRoute }