import mongoose from "mongoose";
import { ConnectionRequestInterface } from "../types/dbInterfaces.js";

const connectionRequestSchema = new mongoose.Schema<ConnectionRequestInterface>(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["interested", "ignored", "accepted", "rejected"],
        message: "{VALUE} is not supported.",
      },
      required: true,
    },
  },
  { timestamps: true }
);
connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    const error = new Error("Cannot send connection request to yourself");
    return next(error);
  }
  next();
});

const ConnectionRequestModel = mongoose.model<ConnectionRequestInterface>(
  "ConnectionRequest",
  connectionRequestSchema
);
export default ConnectionRequestModel;
