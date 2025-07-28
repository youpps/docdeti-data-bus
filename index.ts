import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import createDatabase from "./database";
import { Repositories } from "./repositories";
import { routes } from "./routes";

dotenv.config();

const APP_PORT = process.env.APP_PORT;

const DB_HOST = process.env.DB_HOST || "";
const DB_PORT = process.env.DB_PORT || "";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_DATABASE = process.env.DB_DATABASE || "";
const DB_USER = process.env.DB_USER || "";

async function start() {
  try {
    const app = express();

    const database = createDatabase({
      host: DB_HOST,
      port: DB_PORT,
      password: DB_PASSWORD,
      user: DB_USER,
      database: DB_DATABASE,
    });

    const repositories = Repositories.initialize(database);

    app.use(
      express.urlencoded({
        extended: true,
      })
    );

    app.use(
      express.json({
        limit: "30kb",
      })
    );

    app.use(morgan("dev"));

    app.use(cors());

    app.use("/api", routes(repositories));

    app.listen(APP_PORT, () => {
      console.log(`http://localhost:${APP_PORT}`);
    });
  } catch (e) {
    console.log("Something went wrong: ", e);
  }
}

start();
