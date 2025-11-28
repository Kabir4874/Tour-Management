import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler.js";
import notFound from "./app/middlewares/notFound.js";
import router from "./app/routes/index.js";

const app = express();
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
