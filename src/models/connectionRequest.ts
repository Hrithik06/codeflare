import mongoose from "mongoose"
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
            message: "{VALUE} is invalid type of status"
        },
        required: true
    },
})

const ConnectionRequestModel = mongoose.model("ConnectionRequest", connectionRequestSchema)
export default ConnectionRequestModel;
