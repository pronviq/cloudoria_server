require("dotenv/config");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const fileUpload = require("express-fileupload");

const UserRouter = require("./routers/UserRouter");
const FileRouter = require("./routers/FileRouter");

const ErrorMiddleware = require("./middlewares/ErrorMiddleware");

const PORT = process.env.PORT || 5000;
const ORIGIN = process.env.ORIGIN;
// const ORIGIN = "http://localhost:3000";
// const ORIGIN = "*";

const app = express();

app.use(fileUpload({}));
app.use(express.json());
app.use(express.static("static"));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ORIGIN,
    methods: "GET,PUT,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  })
);
app.use("/api", UserRouter);
app.use("/api", FileRouter);
app.use(ErrorMiddleware);

const start = () => {
  try {
    app.listen(PORT, () => console.log(`\x1b[33m*** Сервер запущен на ${PORT} порту ***\x1b[0m`));
  } catch (error) {
    console.log(`index.js error: ${error}`);
  }
};

start();
