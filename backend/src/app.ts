import cors from "cors";
import express, { type Request, type Response } from "express";
import { UserRoutes } from "./app/modules/user/user.route.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/user", UserRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Server is Working",
  });
});

export default app;
