import mongoose from "mongoose"
import { sendResponse } from "../utils/responseHelper.js";
import { ConnectionRequestInterface } from "../types/dbInterfaces.js";


const connectionRequestSchema = new mongoose.Schema<ConnectionRequestInterface>({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ["interested", "ignored", "accepted", "rejected"],
            message: "{VALUE} is not supported."
        },
        required: true
    },
})
connectionRequestSchema.pre("save", function (next) {
    try {
        if (String(this.fromUserId) === String(this.toUserId)) {
            throw new Error("fromUserId and toUserId are same")
        }
        next()
    } catch (err) {
        if (err instanceof Error)
            next(err)
    }
})
const ConnectionRequestModel = mongoose.model<ConnectionRequestInterface>("ConnectionRequest", connectionRequestSchema)
export default ConnectionRequestModel;
