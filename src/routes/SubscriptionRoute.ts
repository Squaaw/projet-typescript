import { Router } from "express";
import { SubscriptionController } from '../controller/SubscriptionController';
import { subscriptionMidd } from '../middlewares/subscription.middleware';

const route: Router = Router();

// Route to subscription page
route.put('/', subscriptionMidd, SubscriptionController.subscription);

export { route as SubscriptionRoute }