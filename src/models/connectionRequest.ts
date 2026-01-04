import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema(
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
	{ timestamps: true },
);
export type ConnectionRequest = mongoose.InferSchemaType<
	typeof connectionRequestSchema
>;

export type ConnectionRequestDocument =
	mongoose.HydratedDocument<ConnectionRequest>;

connectionRequestSchema.pre("save", function (next) {
	const connectionRequest = this;
	if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
		const error = new Error("Cannot send connection request to yourself");
		return next(error);
	}
	next();
});

const ConnectionRequestModel = mongoose.model<ConnectionRequestDocument>(
	"ConnectionRequest",
	connectionRequestSchema,
);

export default ConnectionRequestModel;
