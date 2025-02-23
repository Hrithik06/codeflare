import express, { Request, Response } from "express"
import { userAuth } from "../middlewares/index.js"
import { sendResponse } from "../utils/responseHelper.js"
const profileRouter = express.Router()

profileRouter.get("/profile.view", userAuth, async (req: Request, res: Response) => {
    try {
        const user = req?.user;
        sendResponse(res, 200, true, "Profile Data", user);
    } catch (err: any) {
        console.error("Profile ERROR :", err);
        return sendResponse(res, 500, false, "Internal server error ", null, [
            { field: "ProfileError", message: err.message },
        ]);
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req: Request, res: Response) => {

})
profileRouter.patch("/profile/password", userAuth, async (req: Request, res: Response) => {

})

export default profileRouter;