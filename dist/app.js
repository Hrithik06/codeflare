import express from "express";
import { connectDB } from "./config/database.js";
const app = express();
app.get("/signup", (req, res) => {
    res.send("Hello from Express1");
});
connectDB()
    .then(() => {
    console.log("DB Connection successfull ");
    app.listen(7777, () => {
        console.log("Server successfully listening on port 7777");
    });
})
    .catch((err) => {
    //TODO: Define Error Object. NEVER use any
    console.error("Database connection failed :: " + err.message);
});
// app.listen(7777, () => {
//   console.log("Server successfully listening on port 7777");
// });
