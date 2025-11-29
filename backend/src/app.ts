import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import expressSession from "express-session";
import { StatusCodes } from "http-status-codes";
import passport from "passport";
import envVars from "./app/config/env.js";
import "./app/config/passport.js";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler.js";
import notFound from "./app/middlewares/notFound.js";
import router from "./app/routes/index.js";

const app = express();

app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    message: "Server is Working",
  });
});

app.use(notFound);

app.use(globalErrorHandler);

export default app;
