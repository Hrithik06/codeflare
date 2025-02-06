import express, { type Request, type Response } from "express";
import { connectDB } from "./config/database.js";
const app = express();
import User from "./models/user.js";
import { UserInterface } from "./types/dbInterfaces.js";
// const user = new User({
//   firstName: "Jess",
//   lastName: "Faden",
//   email: "Jess@Faden.com",
//   password: "Faden@1234",
//   age: 30,
//   gender: "female",
// });

app.use(express.json());
app.post("/signup", async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();
    console.log(user.email);
    res.send("User created");
  } catch (error: any) {
    res.status(500).send("Something went wrong: " + error.message);
  }
});

connectDB()
  .then(() => {
    console.log("DB Connection successfull ");

    app.listen(7777, () => {
      console.log("Server successfully listening on port 7777");
    });
  })
  .catch((err: any) => {
    //TODO: Define Error Object. NEVER use any
    console.error("Database connection failed :: " + err.message);
  });
