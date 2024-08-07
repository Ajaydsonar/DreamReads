import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// express middelwares

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// user routes
import authorRouter from "./routes/author.Routes.js";

app.use("/api/v1/author", authorRouter);

//book routes
import bookRouter from "./routes/book.Routes.js";
app.use("/api/v1/books", bookRouter);

// user routes
import userRouter from "./routes/user.Routes.js";

app.use("/api/v1/users", userRouter);

// review routes
import reviewRouter from "./routes/review.Routes.js";

app.use("/api/v1/reviews", reviewRouter);

app.get("/", (req, res) => {
  res.send("ok");
});

//global error middleware
import { errorMiddleware } from "./middlewares/error.middleware.js";
app.use(errorMiddleware);

export { app };
