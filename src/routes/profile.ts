import express, { Request, Response } from "express";
import userAuth from "../middlewares/userAuth.js";
import { sendResponse } from "../utils/responseHelper.js";
import { validateProfileEdit } from "../validators/index.js";

const profileRouter = express.Router();

profileRouter.get(
  "/profile/view",
  userAuth,
  async (req: Request, res: Response) => {
    try {
      const user = req?.user;
      sendResponse(res, 200, true, "Profile Data", user);
    } catch (err) {
      if (err instanceof Error) {
        return sendResponse(res, 500, false, "Internal server error ", null, [
          { field: "ProfileError", message: err.message },
        ]);
      } else {
        return sendResponse(res, 500, false, "An unknown error occurred");
      }
    }
  }
);

profileRouter.patch(
  "/profile/edit",
  userAuth,
  validateProfileEdit,
  async (req: Request, res: Response) => {
    try {
      const loggedInUser = req.user;
      Object.assign(loggedInUser, req.validatedData);

      //Update data of loggedInUser with the data recieved from user
      // Object.keys(req.validatedData).forEach(key => loggedInUser[key] = req.validatedData[key])
      //NO need to do this as ZOD removes fields which are not present in schema
      return sendResponse(
        res,
        200,
        true,
        `${loggedInUser?.firstName}'s profile updated successfully`,
        loggedInUser
      );
    } catch (err) {
      if (err instanceof Error) {
        return sendResponse(res, 500, false, "Internal server error ", null, [
          { field: "ProfileError", message: err.message },
        ]);
      } else {
        return sendResponse(res, 500, false, "An unknown error occurred");
      }
    }
  }
);

//TODO: Implement password reset
profileRouter.patch(
  "/profile/password",
  userAuth,
  async (req: Request, res: Response) => {}
);

export default profileRouter;
