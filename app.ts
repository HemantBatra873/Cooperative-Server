import express from "express";
import { config } from "dotenv";
import appRouter from "./src/routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
config();
const app = express();

//middlewares
app.use(cors({ origin: process.env.ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/api/v1", appRouter);

export default app;
