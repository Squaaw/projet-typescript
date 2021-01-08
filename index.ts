import { config } from "dotenv";
import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import { AuthentificationRoute } from "./src/routes/AuthentificationRoute";
import { UserRoute } from "./src/routes/UserRoute";
import { SongRoute } from "./src/routes/SongRoute";
import { SubscriptionRoute } from "./src/routes/SubscriptionRoute";

config();

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

app.get('*', function(req, res){
    return res.end('<h1>404! not found</h1>');
  });

app.listen(process.env.PORT, () => {
    console.log(`Server run to http://localhost:${process.env.PORT}`);
});