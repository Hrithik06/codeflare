import express, { Request, Response } from "express"
import userAuth from "../middlewares/userAuth.js"

const requestRouter = express.Router()

requestRouter.post("/request/send/interested/:userId", userAuth, async (req: Request, res: Response) => { })
requestRouter.post("/request/send/ignored/:userId", userAuth, async (req: Request, res: Response) => { })
requestRouter.post("/request/review/acccepted/:requestId", userAuth, async (req: Request, res: Response) => { })
requestRouter.post("/request/review/rejected/:requestId", userAuth, async (req: Request, res: Response) => { })
export default requestRouter 
