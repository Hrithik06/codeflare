import express, { Request, Response } from "express"
import userAuth from "../middlewares/userAuth.js"
import ConnectionRequest from "../models/connectionRequest.js"
import User from "../models/user.js"
import { validateConnectionRequest } from "../validators/index.js"
import { sendResponse } from "../utils/responseHelper.js"
const requestRouter = express.Router()

requestRouter.post("/request/send/:status/:toUserId",
    userAuth, validateConnectionRequest,
    async (req: Request, res: Response) => {
        try {
            const fromUserId = req.user._id
            const { toUserId, status } = req.params;
            //If user tries to connect with thier own profile
            if (String(fromUserId) === String(toUserId)) {
                return sendResponse(res, 400, false, "Dude WTF, trying to send connection to your own profile?")
            }
            //First check whether toUser exists or not?
            const toUserExists = await User.findById(toUserId)
            if (!toUserExists) {
                return sendResponse(res, 400, false, "You tried connecting with a invalid user", null, [{ field: "toUserId", message: "User not Found" }])
            }

            //using or condition to check if there is already request between users userA->userB or userB->userA
            const existingConnection = await ConnectionRequest.
                findOne({
                    $or: [
                        { fromUserId, toUserId },
                        { fromUserId: toUserId, toUserId: fromUserId },
                    ]
                })
            if (existingConnection) {
                return sendResponse(res, 400, false, `${toUserExists.firstName} is already in your network`)
            }
            const newConnectionRequest = new ConnectionRequest({ fromUserId, toUserId, status })
            newConnectionRequest.save()

            res.send(newConnectionRequest)
        } catch (err) {

        }
    })















requestRouter.post("/request/send/ignored/:userId", userAuth, async (req: Request, res: Response) => { })
requestRouter.post("/request/review/acccepted/:requestId", userAuth, async (req: Request, res: Response) => { })
requestRouter.post("/request/review/rejected/:requestId", userAuth, async (req: Request, res: Response) => { })
export default requestRouter 
