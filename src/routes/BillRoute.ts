import { Router } from "express";
import { BillController } from '../controller/BillController';
import { billMidd } from '../middlewares/bill.middleware';

const route: Router = Router();

// Route to bills page
route.get('/', billMidd, BillController.bill);

export { route as BillRoute }