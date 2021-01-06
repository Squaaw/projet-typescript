import { Router } from 'express';
import { UserController } from '../controller/UserController';
import { updateMidd, signOutMidd, addChildMidd, removeChildMidd, getChildMidd } from '../middlewares/user.middleware';

const route: Router = Router();

// Update user data
route.put('/', updateMidd, UserController.update);

// Log out current user
route.delete('/off', signOutMidd, UserController.signOut);

// Add a child account
route.post('/child', addChildMidd, UserController.addChild);

// Remove a child account
route.delete('/child', removeChildMidd, UserController.removeChild);

// Get children account data
route.get('/child', getChildMidd, UserController.getChild);

export { route as UserRoute }