import express, { Request, Response } from "express";
import userAuth from "../middlewares/userAuth.js";
import validateContactUs from "../validators/validateContactUs.js";
import { sendContactFormToOwner } from "../utils/emailBuilder.js";
const contactUsRouter = express.Router();

contactUsRouter.post(
  "/contact-us",
  userAuth,
  validateContactUs,
  async (req: Request, res: Response) => {
    // res.send("Thanks for the message we will contact you.");
    const { emailId, _id, firstName, lastName } = req.user;

    const { subject, message } = req.validatedData;
    sendContactFormToOwner({
      emailId: emailId,
      firstName: firstName,
      lastName: lastName,
      userId: _id.toString(),
      subject: subject,
      message: message,
    });
    res.json(req.validatedData);
  }
);
export default contactUsRouter;
