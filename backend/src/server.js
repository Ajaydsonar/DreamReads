import "dotenv/config";
import { app } from "./app.js";
import connectDB from "./DB/dbConnection.js";

const port = process.env.PORT;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("express err : ", error);
      throw error;
    });

    //listen on app
    app.listen(port, () => {
      console.log("App is running on http://localhost:8080/");
    });
  })
  .catch((err) => {
    console.log("MongoDB Connection Failed :", err);
  });
