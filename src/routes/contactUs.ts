import express, { Request, Response } from "express";
import userAuth from "../middlewares/userAuth.js";
import validateContactUs from "../validators/validateContactUs.js";
const contactUsRouter = express.Router();

contactUsRouter.post(
  "/contact-us",
  userAuth,
  validateContactUs,
  async (req: Request, res: Response) => {
    res.send("Thanks for the message we will contact you.");
  }
);
export default contactUsRouter;
