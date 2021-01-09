import { config } from "dotenv";
import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import { AuthentificationRoute } from "./src/routes/AuthentificationRoute";
import { UserRoute } from "./src/routes/UserRoute";
import { SongRoute } from "./src/routes/SongRoute";
import { SubscriptionRoute } from "./src/routes/SubscriptionRoute";
import { BillRoute } from "./src/routes/BillRoute";

config();
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Main & authentification routes.
app.use('/', AuthentificationRoute);

// Subscription route.
app.use('/subscription', SubscriptionRoute);

// User routes.
app.use('/user', UserRoute);

// Songs routes.
app.use('/songs', SongRoute);

// Bills route.
app.use('/bill', BillRoute);

// Allows the use of external ressources (css, js, images files...)
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(req, res){
    const indexPath = path.resolve("./404.html");
    res.sendFile(indexPath);
  });

app.listen(process.env.PORT, () => {
    console.log(`Server run to http://localhost:${process.env.PORT}`);
});