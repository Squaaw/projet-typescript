import { Router } from 'express';
import { UserController } from '../controller/UserController';
import { updateMidd, signOutMidd, addChildMidd, removeChildMidd, getChildMidd, removeUserMidd, addCardMidd } from '../middlewares/user.middleware';

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

// Remove a user account
route.delete('/', removeUserMidd, UserController.removeUser);

// Adding a credit card
route.put('/cart', addCardMidd, UserController.addCard);

export { route as UserRoute }